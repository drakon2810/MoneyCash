import "./App.css";
import logo from "./logo.png";
import { Layout, Button } from "antd";
import CurrentBalance from "./componets/CurrentBalance";
import RequestAndPay from "./componets/RequestAndPay";
import AccountDetails from "./componets/AccountDetails";
import RecentActivity from "./componets/RecentActivity";
import {useConnect, useAccount, useDisconnect} from "wagmi";
import {MetaMaskConnector} from "wagmi/connectors/metaMask";
import axios from "axios";
import {  useState, useEffect} from "react";

const { Header, Content } = Layout;

function App() {  
  const [name,setName] = useState("...");
  const [balance,setBalance] = useState("...");
  const [dollars,setDollars] = useState("...");
  const [history,setHistory] = useState(null);
  const [requests,setRequests] = useState({"1":[0], "0":[]});

  const {address, isConnected} = useAccount();
  const {disconnect} = useDisconnect();
  const { connect } = useConnect({
    connector: new MetaMaskConnector()
  })

  function disconnectAndSetNull() {
    disconnect();
    setName("...")
    setBalance("... ");
    setDollars("...");
    setHistory("...");
    setRequests();
  }

  async function getNameAndBalance(){
    const res = await axios.get('http://localhost:3005/getNameAndBalance', {
      params: {userAddress: address},
    });

    const response = res.data;

    
    console.log(response);
 
    if (response.jsonResponse.name) {
  setName(response.jsonResponse.name[0]);
}
    setBalance(String(response.jsonResponse.balance));
    setDollars(String(response.jsonResponse.dollars));
    setHistory(response.jsonResponse.history);
    setRequests(response.jsonResponse.requests);

  }
  
  useEffect(() => {
    if (!isConnected) return;
    getNameAndBalance();
  }, [isConnected]);



  return (
    <div className="App">
      <Layout>
        <Header className="header">
          <div className="headerLeft">
            <img src={logo} alt="logo" className="logo" />
            {isConnected &&
            <>
              <div
                className="menuOption"
                style={{ borderBottom: "1.5px solid black" }}
              >
                Summary
              </div>
              <div className="menuOption">Activity</div>
              <div className="menuOption">{`Send & Request`}</div>
              <div className="menuOption">Wallet</div>
              <div className="menuOption">Help</div>
              
            </>
            }
          </div>
            {isConnected ? (
          <Button type = {"primary"} onClick={disconnectAndSetNull}> Disconnect Wallet </Button>
             ) : (
          <Button type = {"primary"} onClick={()=> {connect()}}> Connect Wallet</Button>
       )  }
        </Header>
        <Content className="content">
        {isConnected ? ( 
          <>
          <div className="firstColumn">
            <CurrentBalance dollars={dollars}/>
            <RequestAndPay  requests = {requests} getNameAndBalance={getNameAndBalance}/>
            <AccountDetails 
            address = {address}
            name = {name}
            balance = {balance}/>
          </div>
          <div className="secondColumn">
            <RecentActivity history={history}/>
          </div>
          </> ) : (
            <div>Please Login</div>
          )}
        </Content>
      </Layout>
    </div>
  );
}

export default App;
