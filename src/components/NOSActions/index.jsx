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
  function isInt(value) {
    return !isNaN(value) &&
         parseInt(Number(value)) == value &&
         !isNaN(parseInt(value, 10));
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
               if(isInt(cur.value))ret_val.push(parseInt(cur.value))
               else ret_val.push(hex2a(cur.value))
           }
           else ret_val.push(cur.value.toString());
       }
       return ret_val
  }

class NOSActions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {address: '', value: '', comments:[]}
    this.neo = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
    this.gas = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    this.scriptHash = "60b6a06da01ee8ffd7b8b874fc55e29cd930f26e";
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleSendAddress = this.handleSendAddress.bind(this)
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
  }

  async set_address() {
    const { classes, nos } = this.props;
    const res = await nos.getAddress()
    const addr = await res
    console.log(addr)
    await this.setStateAsync({owner: addr})
    //this.check_bookmark()
    //this.check_flag()

  }

  check_flag(address){
    const { classes, nos } = this.props;
    const operation = "check_flag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.testInvoke(invoke)
    res.then((result) => {
      const is_flagged = result.stack[0].value[1].value == '1'
      const flag_count_str = result.stack[0].value[0].value
      const flag_count =  flag_count_str ? parseInt(flag_count_str) : 0
      console.log(is_flagged)
      this.setState({is_flagged: is_flagged, flag_count: flag_count})
    })
    .catch((err) => alert(`Error checking favorite: ${err.message}`));
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

  check_bookmark() {
    const { classes, nos } = this.props;
    const operation = "check";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.testInvoke(invoke)

    res.then((result) => {
      //alert(JSON.stringify(result))
      const is_favorite = result.stack[0].value == '1'
      console.log(is_favorite)
      this.setState({is_favorite: is_favorite})
    })
    .catch((err) => alert(`Error checking favorite: ${err.message}`));
  }
  remove_bookmark(){
    const { classes, nos } = this.props;
    const operation = "remove";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.invoke(invoke)
    // alert(JSON.stringify(res))
    res.then((txid) => {
      this.setState({is_favorite: false})
      alert(`Removed from favorite in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}`));
  }
  remove_flag(){
    const { classes, nos } = this.props;
    const operation = "unflag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_flagged: false, flag_count: this.state.flag_count - 1})
      alert(`Removed from favorite in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}`));
  }
  add_bookmark(){
    const { classes, nos } = this.props;
    const operation = "add";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_favorite: true})
      alert(`Added to favorite in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}`));
  }

  add_flag(){
    const { classes, nos } = this.props;
    const operation = "flag";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_flagged: true, flag_count: this.state.flag_count + 1})
      alert(`Address flagged in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}, try again after some time`));
  }

  add_comment(comment){
    const { classes, nos } = this.props;
    const operation = "add_comment";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav, comment]
    const res = nos.invoke(invoke)
    // alert(JSON.stringify(res))
    res.then((txid) => alert(`comment added in transaction ${txid}`))
    .catch((err) => alert(`Error adding comment: ${err.message}`));
  }

  get_comments(){
    const { classes, nos } = this.props;
    const operation = "get_comments";
    const check_fav = `*${this.state.address}`
    const owner = "*" + this.state.owner
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner, check_fav]
    const res = nos.testInvoke(invoke)

    //console.log(JSON.stringify(des_res))
    //
    //console.log(size)
    res.then((result) => {
        const comments_list_be = deserialize_array(result.stack[0].value)
        console.log(JSON.stringify(comments_list_be))
        var comments_list_fe = []
        for (var i = 0; i < comments_list_be.length;i++){
          var comments_list = comments_list_be[i]
          const address = comments_list[0]
          const size = comments_list[1]
          const comments = comments_list.slice(2, 2+size)
          comments_list_fe.push({address:address, comments:comments})
        }
        this.setState({comments: comments_list_fe})
    })
    .catch((err) => alert(`Error getting comments: ${err.message}`));

  }




  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state.comment)
    this.add_comment(this.state.comment)
  }

  handleSend(event){
    const { classes, nos } = this.props;
    event.preventDefault();
    const amount = this.state.amount.toString();
    const receiver = this.state.address;
    nos.send({ asset: this.gas, amount, receiver })
    .then((txid) => alert(`${amount} GAS sent in transaction ${txid}`))
    .catch((err) => alert(`Error: ${err.message}`));
  }

  handleSendAddress(event){
    this.state.address = event.target.value
    this.set_asset('neo', this.neo)
    this.set_asset('gas', this.gas)
    this.check_bookmark()
    this.check_flag()
    this.get_comments()
  }


  render() {
    const { classes, nos } = this.props;
    var shown = {
      display: this.state.address ? "block" : "none"
    };
    return (
      <React.Fragment>
        <div>
          <form onSubmit={this.handleSend}>
            <label>
              Send GAS To:
              <input type="text" name="sendto" onBlur={this.handleSendAddress} />
            </label>
            <label>
              Amount:
              <input type="text" name="amount" onChange={this.handleChange}/>
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div style={shown}>
        <div>
          <h3>Address: <span>{this.state.address}</span></h3>
        </div>
        <div>
          <h3>NEO Balance:
          <span>
          {this.state.neo}</span></h3>
        </div>
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
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              Add Comment:
              <input type="text" name="comment" onChange={this.handleChange}/>
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div>
           <h3>Comments</h3>
           <ul>
                {
                  this.state.comments.map(function(comments_a, index){
                      comments_a.comments.map(function(comment,index){
                        return <li key={ index }>{comment}</li>;
                      })
                    return <ul>{comments_a.address}</ul>
                  })
                }
            </ul>
        </div>
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
