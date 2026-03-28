import { Component } from "./etheral-shadow";

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-[#0a0a0f]">
      <Component
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
        showTitle={true} // In the demo, we show the title
      />
    </div>
  );
};

export { DemoOne };
