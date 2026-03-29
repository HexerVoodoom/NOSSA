import imgImg from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute h-[2396px] left-0 top-0 w-[1912px]" data-name="img">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[142.31%] left-[-0.1%] max-w-none top-[-22.3%] w-[100.31%]" src={imgImg} />
        </div>
      </div>
    </div>
  );
}