import { run } from "hardhat";

interface ErrorWithMessage {
  message: string;
}

function hasMessage(e: unknown): e is ErrorWithMessage {
  try {
    return (e as ErrorWithMessage).message !== undefined;
  } catch (err) {
    return false;
  }
}

const verify = async (contractAddress: string, args: unknown) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (hasMessage(e) && e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
};

export { verify };
