const STEPS = ['Draft', 'Confirmed', 'Processing', 'Dispatched', 'Delivered'];

function OrderStatusTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 font-medium">
        <span className="w-3 h-3 rounded-full bg-red-600"></span>
        Order Cancelled
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className={`w-3 h-3 rounded-full ${isDone ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
              {index < STEPS.length - 1 && (
                <span className={`w-0.5 h-8 ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
              )}
            </div>
            <span className={`text-sm pb-6 ${isDone ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default OrderStatusTimeline;