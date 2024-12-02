import { SafePayloadBuilder } from "./safe-payload.builder";

describe("SafePayloadBuilder", () => {
  const builder = new SafePayloadBuilder();

  it("builds USDC transfer calldata on sepolia", () => {
    const payload = builder.buildErc20Transfer({
      chainId: 11155111,
      tokenAddress: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4",
      toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amountNative: "1500000000",
    });

    expect(payload.to.toLowerCase()).toBe("0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4");
    expect(payload.value).toBe("0");
    expect(payload.data).toMatch(/^0xa9059cbb/);
    expect(payload.operation).toBe(0);
  });
});
