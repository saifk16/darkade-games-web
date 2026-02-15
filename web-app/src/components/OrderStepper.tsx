import { Check, Truck, Package, Clock, ShoppingBag } from 'lucide-react';

interface OrderStepperProps {
    status: string; // 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
    createdAt: string;
    updatedAt?: string;
}

const steps = [
    { label: 'Placed', value: 'Pending', icon: ShoppingBag },
    { label: 'Processing', value: 'Processing', icon: Clock },
    { label: 'Shipped', value: 'Shipped', icon: Truck },
    { label: 'Delivered', value: 'Delivered', icon: Check },
];

export default function OrderStepper({ status, createdAt, updatedAt }: OrderStepperProps) {
    if (status === 'Cancelled') {
        return (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-3 border border-red-100">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <Check size={16} />
                </div>
                <div>
                    <p className="font-bold text-sm">Order Cancelled</p>
                    <p className="text-xs opacity-80">This item has been cancelled.</p>
                </div>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(s => s.value === status);
    // If status is not found (e.g. legacy/unknown), assume Pending or handle gracefully
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isLast = index === steps.length - 1;
                    const Icon = step.icon;

                    return (
                        <div key={step.value} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }`}
                            >
                                <Icon size={14} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase transition-colors duration-300 ${isActive ? 'text-indigo-900' : 'text-slate-300'}`}>
                                {step.label}
                            </span>
                            {/* Optional: Show date for current step if available */}
                            {isActive && index === activeIndex && (
                                <span className="text-[9px] text-slate-400 font-medium absolute -bottom-4 w-20 text-center">
                                    {index === 0 ? new Date(createdAt).toLocaleDateString() : 'In Progress'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
