import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { react } from "@nosplatform/api-functions";
import utils from "../../utils"

const { injectNOS, nosProps } = react.default;

const styles = {
  button: {
    margin: "16px",
    fontSize: "14px"
  },
  red: {
    color: "red"
  },
  green: {
    color: "green"
  }
};
 function convertUnicode(input) {
    var comma_separated = input.replace(/\\u(\w\w\w\w)/g,function(a,b) {
      var charcode = parseInt(b,16);
      if (charcode == 0) return ''
      else if (charcode == 3|| charcode==4) return ','
      else return String.fromCharCode(charcode);
    });

    return comma_separated.split(',')
  }
  function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  function deserialize_array(data){
      var ret_val = []
      console.log(JSON.stringify(data))
      if (!data || data.length == 0) return []
      for (var i = 0; i < data.length;i++){
           console.log(JSON.stringify(data[i]))
           var cur = data[i]
           var type = cur.type
           if (type == 'Array'){
               var par_val = deserialize_array(cur.value)
               if (par_val.length > 0)
                 ret_val.push(par_val)
           }
           else if(type == 'ByteArray'){
               ret_val.push(hex2a(cur.value))
           }
           else ret_val.push(cur.value.toString());
       }
       return ret_val
  }

class NOSActions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {address: 'AZ81H31DMWzbSnFDLFkzh9vHwaDLayV7fU'}
    this.neo = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
    this.gas = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    this.scriptHash = "60b6a06da01ee8ffd7b8b874fc55e29cd930f26e";
  }
  handleAlert = async func => { var value = await func;
          //console.log(convertUnicode(JSON.stringify(value.substring(4))));
          //alert(convertUnicode(JSON.stringify(value.substring(4))));
          //var ab = utils.unhex(value.stack)
          var ab = JSON.stringify(value)
          alert(ab)
          console.log(JSON.stringify(deserialize_array(value.stack[0].value)))
        }

  handleGetAddress = async address => { alert(this.address);}

  handleClaimGas = () =>
    this.props.nos
      .claimGas()
      .then(alert)
      .catch(alert);

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }
  async componentDidMount() {
    this.set_address()
    this.set_asset('neo', this.neo)
    this.set_asset('gas', this.gas)
  }

  async set_address() {
    const { classes, nos } = this.props;
    const res = await nos.getAddress()
    const addr = await res
    console.log(addr)
    await this.setStateAsync({owner: addr})
    this.check_bookmark()
    this.check_flag()
    this.get_comments()

  }

  async get_comments(){
    const { classes, nos } = this.props;
    const operation = "get_comments";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.testInvoke(invoke)
    alert(JSON.stringify(deserialize_array(res.stack[0].value)))
  }

  async check_flag(){
    const { classes, nos } = this.props;
    const operation = "check_flag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.testInvoke(invoke)
    //alert(JSON.stringify(res))
    const is_flagged = res.stack[0].value[1].value == '1'
    const flag_count = parseInt(res.stack[0].value[0].value)
    console.log(is_flagged)
    await this.setStateAsync({is_flagged: is_flagged, flag_count: flag_count})

  }

  async set_asset(name, hash) {
    const { classes, nos } = this.props;
    const res = await nos.getBalance({ asset: hash, address: this.state.address })
    const balance = await res
    console.log(balance)
    var dict = {}
    dict[name] = balance
    await this.setStateAsync(dict)
  }

  async check_bookmark() {
    const { classes, nos } = this.props;
    const operation = "check";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.testInvoke(invoke)
    // alert(JSON.stringify(res))
    const is_favorite = res.stack[0].value == '1'
    console.log(is_favorite)
    await this.setStateAsync({is_favorite: is_favorite})
  }
  async remove_bookmark(){
    const { classes, nos } = this.props;
    const operation = "remove";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.invoke(invoke)
    // alert(JSON.stringify(res))
    console.log(res)
    await this.setStateAsync({is_favorite: false})
  }
  async remove_flag(){
    const { classes, nos } = this.props;
    const operation = "unflag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.invoke(invoke)
    // alert(JSON.stringify(res))
    console.log(res)
    await this.setStateAsync({flagged: false})
  }
  async add_bookmark(){
    const { classes, nos } = this.props;
    const operation = "add";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.invoke(invoke)
    // alert(JSON.stringify(res))
    console.log(res)
    await this.setStateAsync({is_favorite: true})
  }

  async add_flag(){
    const { classes, nos } = this.props;
    const operation = "flag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = await nos.invoke(invoke)
    // alert(JSON.stringify(res))
    console.log(res)
    await this.setStateAsync({is_flagged: true})
  }


  render() {
    const { classes, nos } = this.props;
    const rpx = "220fbdac9761352dba8d97c4874224ddb68b13d9";
    const operation = "add"
    // Add your smart contract's scriptHash here

    // The operation of your smart contract you want to (test)invoke


    // The necessary arguments for you (test)invoke
    // const addr = this.address
    // const args = [addr];

    // The storagekey you want to query
    const key = "*AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y.target";

    // The amount and recipient of your send function
    const recipient = "";
    const amount = "";
    const scriptHash = this.scriptHash;
    const invoke = { scriptHash, operation }; // and testInvoke
    const getStorage = { scriptHash, key, decodeOutput: true };
    const send = { amount, asset: this.gas, recipient };
    return (
      <React.Fragment>
        <div>
          <h3>Address: <span>{this.state.address}</span></h3>
        </div>
        {/*<button className={classes.button} onClick={() =>{ this.handleGetAddress(nos.getAddress());}}>
           Get Address
         </button>
        <button
          className={classes.button}
          onClick={() => this.handleAlert(nos.getBalance({ asset: neo }))}
        >
        </button>*/}
        <div>
          <h3>NEO Balance:
          <span>
          {this.state.neo}</span></h3>
        </div>
        {/*<button
          className={classes.button}
          onClick={() => this.handleAlert(nos.getBalance({ asset: this.gas }))}
        >
          {this.state.gas}
        </button>*/}
        <div>
          <h3>GAS Balance:
          <span>
          {this.state.gas}</span></h3>
        </div>
        <div>
        <strong>
          {(() => {
            switch (this.state.is_favorite) {
              case true:   return "Address is favorite";
              default:      return "Address not favorite";
            }
          })()}
        </strong>
        </div>
        <div>
        {/*<button
          className={classes.button}
          onClick={() => this.handleAlert(nos.getBalance({ asset: rpx }))}
        >
          Get RPX Balance
        </button>

        <button className={classes.button} onClick={this.handleClaimGas}>
          Claim Gas
        </button>
        <button className={classes.button} onClick={() => this.handleAlert(nos.send(send))}>
          Send GAS to...
        </button>*/}

        <button className={classes.button} onClick={() => {
                   this.check_bookmark()
                }
              }>
          Check Favorite
        </button>
          <button disabled={!this.state.is_favorite}
            className={classes.button}
            onClick={() => {
              this.remove_bookmark()
            }
          }
          >
            Remove Favorite
          </button>
        <button disabled={this.state.is_favorite}
            className={classes.button}
            onClick={() => {
              this.add_bookmark()
            }
          }
          >
            Add Favorite
          </button>
        {/*<button
          className={classes.button}
          onClick={() => {
            var storage = nos.getStorage(getStorage);
            this.handleAlert(storage)}}
        >
          GetStorage
        </button>*/}
        </div>
        <div>
        <strong>
          {(() => {
            switch (this.state.is_flagged) {
              case true:   return "Address is flagged by you";
              default:      return "Address not flagged by you";
            }
          })()}
        </strong>
        </div>

        <div>
        <h4 className={this.state.flag_count > 0 ? classes.red: classes.green}>
          {(() => {
            switch (this.state.flag_count > 0) {
              case true:   return `Address is flagged ${this.state.flag_count} times`;
              default:      return "Address is secure";
            }
          })()}
        </h4>
        </div>
        <div>
          <button className={classes.button} onClick={() => {
                   this.check_flag()
                }
              }>
          Check Flagged
        </button>
          <button disabled={!this.state.is_flagged}
            className={classes.button}
            onClick={() => {
              this.remove_flag()
            }
          }
          >
            Remove Flag
          </button>
        <button disabled={this.state.is_flagged}
            className={classes.button}
            onClick={() => {
              this.add_flag()
            }
          }
          >
            Flag this Address
          </button>
        </div>
      </React.Fragment>
    );
  }
}

NOSActions.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  nos: nosProps.isRequired
};

export default injectNOS(injectSheet(styles)(NOSActions));
