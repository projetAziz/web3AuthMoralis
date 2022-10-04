import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { sign } from "crypto";
import { useWeb3Auth } from "../services/web3auth";
import styles from "../styles/Home.module.css";
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useEffect, useState } from "react";
import { Web3AuthCore } from "@web3auth/core";
// import RPC from './ethersRPC' // for using ethers.js
import RPC from "./web3RPC"; // for using web3.js
import axios from "axios";

const Main = () => {
  //this variables it's for login with socials
  const {
    provider,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    signTransaction,
    signAndSendTransaction,
    web3Auth,
    chain,
  } = useWeb3Auth();

  // get claintId from https://dashboard.web3auth.io
  const clientId =
    "BKxP1cDxFwknu0GboZfDp9v7XUX2rDYRmREJSlAOzs5JgI1J4e7vQZHBkDgccmFTmjyEJjVPb7kXjTl8rVJP414";
  //these for login with discord
  const [web3auth2, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider2, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );

  useEffect(() => {
    //initialazion the provider to connect with web3AuthCore because web3Auht dosnt have login with discord
    const init = async () => {
      try {
        const web3auth1 = new Web3AuthCore({
          clientId,
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x3",
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            uxMode: "popup",
            loginConfig: {
              discord: {
                name: "Custom Auth Login",
                verifier: "morali", //get it from https://dashboard.web3auth.io when you create verifier
                typeOfLogin: "discord",
                clientId: "1025413910880333864", //use your app client id you got from discord
              },
            },
          },
        });

        web3auth1.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth1);
        await web3auth1.init();
        if (web3auth1.provider) {
          setProvider(web3auth1.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  const login2 = async () => {
    console.log("web 2 " + web3auth2);
    if (!web3auth2) {
      console.log("web3auth not initialized yet");
      return;
    }

    const web3auth1 = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x3",
      },
    });
    // Initialize Modal
    await web3auth1.initModal();
    //Connecting the Modal
    const web3authProvider = await web3auth1.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "discord",
      }
    );
    setProvider(web3authProvider);

    const user = await web3auth1.getUserInfo();
    //saving the userInfo in herokuapp server backend
    await axios
      .post("https://morali.herokuapp.com/insert", {
        aggregateVerifier: user.aggregateVerifier,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        typeOfLogin: user.typeOfLogin,
        verifierId: user.verifierId,
      })
      .then((res) => {
        console.log("result :" + res.data);
      });
  };

  const getUserInfo2 = async () => {
    if (!web3auth2) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth2.getUserInfo();
    console.log(user);
  };
  const logout2 = async () => {
    if (!web3auth2) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth2.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const chainId = await rpc.getChainId();
    console.log(chainId);
  };
  const getAccounts2 = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const address = await rpc.getAccounts();
    console.log(address);
  };

  const getBalance2 = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const sendTransaction = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  };

  const signMessage2 = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider2) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider2);
    const privateKey = await rpc.getPrivateKey();
    console.log(privateKey);
  };

  //When you login with discord this s all the methods i use for
  const loggedInView2 = (
    <div>
      <button onClick={getUserInfo2} className={styles.card}>
        Get User Info
      </button>
      <button onClick={getAccounts2} className={styles.card}>
        Get Accounts
      </button>
      <button onClick={getBalance2} className={styles.card}>
        Get Balance
      </button>
      <button onClick={sendTransaction} className={styles.card}>
        Send Transaction
      </button>
      <button onClick={signMessage2} className={styles.card}>
        Sign Message
      </button>
      <button onClick={getPrivateKey} className={styles.card}>
        Get Private Key
      </button>
      <button onClick={logout2} className={styles.card}>
        Log Out
      </button>
    </div>
  );

  //When you login with social these methods are created by web3Auth
  const loggedInView = (
    <>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
      </button>
      <button onClick={getAccounts} className={styles.card}>
        Get Accounts
      </button>
      <button onClick={getBalance} className={styles.card}>
        Get Balance
      </button>
      <button onClick={signMessage} className={styles.card}>
        Sign Message
      </button>
      {(web3Auth?.connectedAdapterName === WALLET_ADAPTERS.OPENLOGIN ||
        chain === "solana") && (
        <button onClick={signTransaction} className={styles.card}>
          Sign Transaction
        </button>
      )}
      <button onClick={signAndSendTransaction} className={styles.card}>
        Sign and Send Transaction
      </button>
      <button onClick={logout} className={styles.card}>
        Log Out
      </button>

      <div className={styles.console} id="console">
        <p className={styles.code}>user infor</p>
      </div>
    </>
  );
  const unloggedInView2 = (
    <button onClick={login2} className={styles.card}>
      Login with discord
    </button>
  );
  const unloggedInView = (
    <div>
      <button onClick={login} className={styles.card}>
        LogIn
      </button>
    </div>
  );

  return (
    <div className={styles.grid}>
      {/* results when login with socials */}
      <div>{provider ? loggedInView : unloggedInView}</div>
      {/* results when login with discord */}
      <div>{provider2 ? loggedInView2 : unloggedInView2}</div>
    </div>
  );
};

export default Main;
