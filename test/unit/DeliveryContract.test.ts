import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { developmentChains } from "../../helper-hardhat-config";
import { expect } from "chai";
import { DeliveryContract__factory } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Delivery contract unity tests", function () {
      async function deployDeliveryContractFixture() {
        const DeliveryContract =
          await ethers.getContractFactory<DeliveryContract__factory>(
            "DeliveryContract"
          );
        const [owner, addr1, addr2] = await ethers.getSigners();

        const deliveryContract = await DeliveryContract.deploy();

        return { deliveryContract, owner, addr1, addr2 };
      }

      const chainId = network.config.chainId || 0;
      const paymentAmount = ethers.utils.parseEther("0.001").toString();

      describe("constructor", function () {
        it("sets initial values", async function () {
          const { deliveryContract } = await loadFixture(
            deployDeliveryContractFixture
          );
          expect(
            (await deliveryContract.getMinimumPayment()).toString()
          ).to.equal(ethers.utils.parseEther("0.001").toString());
          expect(
            (await deliveryContract.getNextPackageId()).toString()
          ).to.equal("1");
        });
      });

      describe("createPackage", function () {
        it("reverts if not enough eth paid", async function () {
          const { deliveryContract } = await loadFixture(
            deployDeliveryContractFixture
          );
          await expect(
            deliveryContract.createPackage(
              "location A",
              "location B",
              "some note",
              { value: "0" }
            )
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__NotEnoughETHEntered"
          );
        });

        it("creates new package", async function () {
          const { deliveryContract, owner } = await loadFixture(
            deployDeliveryContractFixture
          );
          await expect(
            deliveryContract.createPackage(
              "location A",
              "location B",
              "some note",
              { value: paymentAmount }
            )
          ).to.changeEtherBalance(owner, -paymentAmount);

          expect(await deliveryContract.getNextPackageId()).to.equal("2");

          const p = await deliveryContract.getPackage("1");
          expect(p.requester).to.equal(await owner.getAddress());
          expect(p.driver).to.equal(ethers.constants.AddressZero);
          expect(p.paymentAmount.toString()).to.equal(paymentAmount);
          expect(p.locationFrom).to.equal("location A");
          expect(p.locationTo).to.equal("location B");
          expect(p.notes).to.equal("some note");
          expect(p.requesterSignedOff).to.equal(false);
          expect(p.driverSignedOff).to.equal(false);
        });
      });

      describe("acceptPackage", function () {
        it("reverts when the driver is not registered", async function () {
          const { deliveryContract } = await loadFixture(
            deployDeliveryContractFixture
          );
          await deliveryContract.createPackage(
            "location A",
            "location B",
            "some note",
            { value: paymentAmount }
          );

          await expect(
            deliveryContract.acceptPackage("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__DriverNotRegistered"
          );
        });

        it("reverts if package id does not exist", async function () {
          const { deliveryContract } = await loadFixture(
            deployDeliveryContractFixture
          );

          await deliveryContract.registerDriver();
          await expect(
            deliveryContract.acceptPackage("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__PackageNotExist"
          );
        });

        it("reverts when the package is already assigned to driver", async function () {
          const { deliveryContract, addr1, addr2 } = await loadFixture(
            deployDeliveryContractFixture
          );
          await deliveryContract.createPackage(
            "location A",
            "location B",
            "some note",
            { value: paymentAmount }
          );

          await deliveryContract.connect(addr1).registerDriver();
          await deliveryContract.connect(addr1).acceptPackage("1");
          await deliveryContract.connect(addr2).registerDriver();

          await expect(
            deliveryContract.connect(addr2).acceptPackage("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__PackageAlreadyAssigned"
          );
        });
      });

      describe("signOffDelivery", function () {
        it("reverts if package id does not exist", async function () {
          const { deliveryContract } = await loadFixture(
            deployDeliveryContractFixture
          );

          await deliveryContract.registerDriver();
          await expect(
            deliveryContract.signOffDelivery("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__PackageNotExist"
          );
        });

        it("reverts when signer is not the requester nor the driver", async function () {
          const { deliveryContract, addr1, addr2 } = await loadFixture(
            deployDeliveryContractFixture
          );
          await deliveryContract.createPackage(
            "location A",
            "location B",
            "some note",
            { value: paymentAmount }
          );

          await deliveryContract.connect(addr1).registerDriver();
          await deliveryContract.connect(addr1).acceptPackage("1");

          await expect(
            deliveryContract.connect(addr2).signOffDelivery("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__NotAllowedToSignOffPackage"
          );
        });

        it("reverts if both parties already have signed off the contract", async function () {
          const { deliveryContract, addr1 } = await loadFixture(
            deployDeliveryContractFixture
          );

          await deliveryContract.createPackage(
            "location A",
            "location B",
            "some note",
            { value: paymentAmount }
          );

          await deliveryContract.connect(addr1).registerDriver();
          await deliveryContract.connect(addr1).acceptPackage("1");

          await deliveryContract.signOffDelivery("1");
          await deliveryContract.connect(addr1).signOffDelivery("1");
          await expect(
            deliveryContract.connect(addr1).signOffDelivery("1")
          ).to.be.revertedWithCustomError(
            deliveryContract,
            "DeliveryContract__PackageAlreadyDelivered"
          );
        });

        it("sends fund to driver after both parties signed off", async function () {
          const { deliveryContract, addr1 } = await loadFixture(
            deployDeliveryContractFixture
          );

          await deliveryContract.createPackage(
            "location A",
            "location B",
            "some note",
            { value: paymentAmount }
          );

          await deliveryContract.connect(addr1).registerDriver();
          await deliveryContract.connect(addr1).acceptPackage("1");

          await deliveryContract.signOffDelivery("1");
          await expect(
            deliveryContract.connect(addr1).signOffDelivery("1")
          ).to.changeEtherBalance(addr1, paymentAmount);
        });
      });
    });
