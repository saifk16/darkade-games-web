import { NextResponse } from 'next/server';
import { checkServiceability } from '@/lib/shiprocket';

export async function POST(request: Request) {
    try {
        const { pickup_pincode, delivery_pincode, weight, cod } = await request.json();

        if (!pickup_pincode || !delivery_pincode) {
            return NextResponse.json({ error: 'Pincodes are required' }, { status: 400 });
        }

        const data = await checkServiceability(pickup_pincode, delivery_pincode, weight, cod);

        console.log(`Serviceability Check: ${pickup_pincode} -> ${delivery_pincode}`, JSON.stringify(data, null, 2));

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Serviceability Error:", error);
        return NextResponse.json(
            { error: error.message || 'Serviceability check failed' },
            { status: 500 }
        );
    }
}
