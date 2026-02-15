import { NextResponse } from 'next/server';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { supabase } from '@/lib/supabase'; // NOTE: This needs to be SERVER client for updates if RLS blocks, but we are using client lib here? 
// Actually, supabase client in lib/supabase might be client-side. We need admin access to update ANY order if RLS restricts? 
// No, RLS allows users to update their own orders usually. 
// BUT, this is a distinct API route. It should probably use a SERVICE ROLE key if we want to be sure, or just rely on RLS if we pass user context?
// For now, let's assume we pass the IDs and update via standard client if configured, OR use `createClient` with admin key here.
// Better: Use Service Role for backend updates to ensure reliability.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { orderData, user, address } = await request.json();

        if (!orderData || !user || !address) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // 1. Create Order in Shiprocket
        const shiprocketData = await createShiprocketOrder(orderData, user, address);

        if (shiprocketData.order_id) {
            // 2. Update Supabase Order with Shiprocket Details
            const { error } = await supabaseAdmin
                .from('orders')
                .update({
                    shiprocket_order_id: shiprocketData.order_id,
                    shipment_id: shiprocketData.shipment_id,
                    awb_code: shiprocketData.awb_code,
                    courier_name: shiprocketData.courier_name,
                    status: 'Processing' // Update status to Processing
                })
                .eq('id', orderData.id);

            if (error) {
                console.error("Supabase Update Error:", error);
                // Don't fail the request if Shiprocket worked, just log it.
            }

            return NextResponse.json({ success: true, shiprocket: shiprocketData });
        } else {
            console.error("Shiprocket Create Error:", shiprocketData);
            return NextResponse.json({ error: 'Failed to create Shiprocket order', details: shiprocketData }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Create Shiprocket Order Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to process shipping' },
            { status: 500 }
        );
    }
}
