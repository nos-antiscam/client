import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { react } from "@nosplatform/api-functions";
import Neon from '@cityofzion/neon-js'
import utils from "../../utils"

const { injectNOS, nosProps } = react.default;

const styles = {
  button: {
    margin: "16px",
    fontSize: "16px"
  },
  red: {
    color: "red"
  },
  green: {
    color: "green"
  },
  blue: {
    color: "blue"
  },
  black: {
    color: "black"
  },
  textbox: {
    paddingRight: "2px"
  },
  margintop7px: {
    marginTop: "7px"
  },
  margintop13px: {
    marginTop: "13px"
  },
  lineBreak: {
    width: "75%",
    borderTop: "1px solid #333333",
  },
  font20px: {
    fontSize: "20px"
  },
  mrgnbtm12px: {
    marginBottom: "12px"
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
    this.state = {address: '', value: '',
                  comments:[
                          {'address':'a',comments:['comment1']},
                          {'address':'b',comments:['comment1']}
                  ],
                  asset: 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
                  favorites: []
                }
    this.assets = {
                    'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b': 'NEO',
                    '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7': 'GAS'
                  }
    this.scriptHash = "dff7bbb3efe7f9da2fad1b56aa0bbd5b811f4fc9";
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleSendAddress = this.handleSendAddress.bind(this)
    this.handleChangeAsset = this.handleChangeAsset.bind(this)
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
    console.log('scriptHash:' + this.scriptHash)
    this.set_address()
  }

  async set_address() {
    const { classes, nos } = this.props;
    const res = await nos.getAddress()
    const addr = await res
    console.log(addr)
    await this.setStateAsync({owner: addr})
    this.get_favorites()
    //this.check_bookmark()
    //this.check_flag()

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

  get_invoke_dict(operation, args){
    const target = `*${this.state.address}`
    const owner_hash = this.state.owner
    const owner = "*" + this.state.owner
    const invoke = { operation: operation }; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [owner_hash, owner, target]
    args.map(function(arg, index){
          invoke['args'].push(arg)
    })
    return invoke
  }

  check_flag(address){
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('check_flag',[])
    const res = nos.testInvoke(invoke)
    res.then((result) => {
      console.log(JSON.stringify(result))
      const is_flagged = result.stack[0].value[1].value == '1'
      const flag_count_str = result.stack[0].value[0].value
      const flag_count =  flag_count_str ? parseInt(flag_count_str) : 0
      console.log(is_flagged)
      this.setState({is_flagged: is_flagged, flag_count: flag_count})
    })
    .catch((err) => alert(`Error checking favorite: ${err.message}`));
  }

  check_bookmark() {
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('check',[])
    const res = nos.testInvoke(invoke)
    res.then((result) => {
      console.log(JSON.stringify(result))
      const is_favorite = result.stack[0].value == '1'
      console.log(is_favorite)
      this.setState({is_favorite: is_favorite})
    })
    .catch((err) => alert(`Error checking favorite: ${err.message}`));
  }
  remove_bookmark(){
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('remove',[])
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
    const invoke = this.get_invoke_dict('unflag',[])
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_flagged: false, flag_count: this.state.flag_count - 1})
      alert(`Removed from favorite in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}`));
  }
  add_bookmark(){
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('add',[])
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_favorite: true})
      alert(`Added to favorite in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}`));
  }

  add_flag(){
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('flag',[])
    const res = nos.invoke(invoke)
    res.then((txid) => {
      this.setState({is_flagged: true, flag_count: this.state.flag_count + 1})
      alert(`Address flagged in transaction ${txid}, wait for next block to check`)
    })
    .catch((err) => alert(`Error adding to favorite: ${err.message}, try again after some time`));
  }

  add_comment(comment){
    const { classes, nos } = this.props;
    const invoke = this.get_invoke_dict('add_comment',[comment])
    const res = nos.invoke(invoke)
    // alert(JSON.stringify(res))
    res.then((txid) => alert(`comment added in transaction ${txid}`))
    .catch((err) => alert(`Error adding comment: ${err.message}`));
  }

  get_comments(){
    const { classes, nos } = this.props;
    const operation = "get_all_comments";
    const address = `*${this.state.address}`
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [address]
    const res = nos.testInvoke(invoke)

    //console.log(JSON.stringify(des_res))
    //
    //console.log(size)
    res.then((result) => {
        console.log(JSON.stringify(result))
        const comments_list_be = deserialize_array(result.stack[0].value)
        console.log(JSON.stringify(comments_list_be))
        var comments_list_fe = []
        for (var i = 0; i < comments_list_be.length;i++){
          var comments_list = comments_list_be[i]
          console.log("commments_list:"+ JSON.stringify(comments_list))
          const address = comments_list[0]
          const size = comments_list[1]
          const comments = comments_list.slice(2, 2+size)
          comments_list_fe.push({address:address, comments:comments})
        }
        this.setState({comments: comments_list_fe})
    })
    .catch((err) => alert(`Error getting comments: ${err.message}`));

  }

  get_favorites(){
    const { classes, nos } = this.props;
    const operation = "fetch";
    const address = `*${this.state.owner}`
    const invoke = { operation}; // and testInvoke
    invoke['scriptHash'] = this.scriptHash
    invoke['args'] = [this.state.owner, address]
    const res = nos.testInvoke(invoke)
    res.then((result) => {
        console.log(JSON.stringify(result))
        const favorites_list_be = deserialize_array(result.stack[0].value)
        console.log(JSON.stringify(favorites_list_be))
        var favorites_list_fe = []
        for (var i = 0; i < favorites_list_be.length;i++){
          const favorite = favorites_list_be[i]
          const favorite_addr = favorite.substring(1)
          console.log("favorite:"+ favorite_addr)
          favorites_list_fe.push(favorite_addr)
        }
        this.setState({favorites: favorites_list_fe})
    })
    .catch((err) => alert(`Error getting favorites list: ${err.message}`));

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
    console.log(this.state.asset)
    if (this.state.flag_count > 0 &&
        !confirm("The address is flagged, Are you sure you want to do this?")) return
    nos.send({ asset: this.state.asset, amount, receiver })
    .then((txid) => alert(`${amount} ${this.assets[this.state.asset]} sent in transaction ${txid}`))
    .catch((err) => alert(`Error: ${err.message}`));
  }

  handleSendAddress(event){
    var address = event.target.value
    if(!address) return
    if(!Neon.is.address(address)){
      alert("invalid NEO address")
      event.target.value = this.state.address
      return
    }
    if(address == this.state.owner){
      alert("Destination NEO address cannot be same as account address")
      event.target.value = this.state.address
      return
    }
    if(this.refs.myTextInput.value != address) this.refs.myTextInput.value = address;
    this.state.address = address
    Object.entries(this.assets).map(([hash, asset], i) => {
        this.set_asset(asset, hash)
    })
    this.check_bookmark()
    this.check_flag()
    this.get_comments()
  }
  handleChangeAsset(event){
    this.setState({ asset: event.target.value });
  }


  render() {
    const { classes, nos } = this.props;
    var shown = {
      display: this.state.address ? "block" : "none",
      margin: "20px"
    };
    const owner = this.state.owner
    return (
      <React.Fragment>
        <div class="form-group" >
          <form onSubmit={this.handleSend}>
            <div class="row">
            <label class="col-md-3">
              Pick from favorites <button type="button" class="btn btn-primary btn-sm" onClick={() => {
                  this.get_favorites()
                }}>
                Refresh
              </button>
              <select  value={this.state.address} onChange={this.handleSendAddress} className={[classes.margintop7px, "form-control"].join(" ")}>
                <option value=""> Select Address...</option>
                {
                   this.state.favorites.map((addr, i) => {
                    return (<option value={ addr }>{addr}</option>)
                  })
                }
              </select>
            </label>
            <label class="col-md-2">
              Pick your asset:
              <select value={this.state.asset} onChange={this.handleChangeAsset} className={[classes.margintop13px, "form-control"].join(" ")}>
                {
                   Object.entries(this.assets).map(([hash, asset], i) => {
                    return (<option value={ hash }>{asset}</option>)
                  })
                }
              </select>
            </label>
            <label class="col-md-4">
              Send {this.assets[this.state.asset]} To:
              <input type="text" name="sendto" ref = "myTextInput" className={[classes.margintop13px, classes.textbox, "form-control"].join(" ")}  onBlur={this.handleSendAddress} />
            </label>
            <label class="col-md-1">
              Amount:
              <input type="text" name="amount" className={[classes.margintop13px, classes.textbox, "form-control"].join(" ")}  onChange={this.handleChange}/>
            </label>
            </div>
            <div class="row">
              <input style={{marginTop: '7px'}} className="col-md-1 offset-md-5 btn btn-success" type="submit" value="Submit" />
            </div>
          </form>
        </div>
        <div style={shown}>
          <h5><strong>Address</strong>: <span>{this.state.address}</span></h5>
          <div className={classes.mrgnbtm12px}>
            <h5><strong>Balances</strong></h5>
            <hr  align="left" className={classes.lineBreak} />
            <div class="row" style={{marginLeft: "2px"}}>
              {
                Object.entries(this.assets).map(([hash, asset], i) => {
                  return (<div class="col-md-3">
                            <strong>{asset}</strong> :
                            <span>
                            {this.state[asset]}</span>
                          </div>)
                })
              }
            </div>
          </div>
          <div className={classes.mrgnbtm12px}>
            <h5><strong>Flag Status</strong></h5>
            <hr align="left" className={classes.lineBreak} />
            <div class="row" style={{marginLeft: "2px"}}>
              <div class="col-md-12">
                <span className={classes.font20px}><strong className={this.state.is_flagged ? classes.red: classes.green}>
                  {(() => {
                    switch (this.state.is_flagged) {
                      case true:   return "[Warning] Address is flagged by you";
                      default:      return "Address not flagged by you";
                    }
                  })()}
                </strong></span>
              </div>
              <div class="col-md-12">
                <span className={classes.font20px}><strong className={this.state.flag_count > 0 ? classes.red: classes.green}>
                  {(() => {
                    switch (this.state.flag_count > 0) {
                      case true:   return `[Warning] Address is flagged ${this.state.flag_count} times`;
                      default:      return "Address is secure";
                    }
                  })()}</strong>
                </span>
              </div>
            </div>
            <div class="row">
              <div class="col-md-2">
                <button className={`${classes.button} btn btn-info btn-sm`} onClick={() => {
                         this.check_flag()
                      }
                    }>
                  Check Flagged
                </button>
              </div>
              <div class="col-md-2">
                <button disabled={!this.state.is_flagged}
                  className={`${classes.button} btn btn-warning btn-sm`}
                  onClick={() => {
                    this.remove_flag()
                  }
                }>
                  Remove Flag
                </button>
              </div>
              <div class="col-md-2">
                <button disabled={this.state.is_flagged}
                    className={`${classes.button} btn btn-danger btn-sm`}
                    onClick={() => {
                      this.add_flag()
                    }
                  }
                  >
                  Flag this Address
                </button>
              </div>
            </div>
          </div>
          <div className={classes.mrgnbtm12px}>
            <h5><strong>Bookmark Status</strong></h5>
            <hr align="left" className={classes.lineBreak} />
            <div class="row" style={{marginLeft: "2px"}}>
              <div class="col-md-12">
              <span className={classes.font20px}><strong className={this.state.is_favorite ? classes.blue: classes.black}>
                {(() => {
                  switch (this.state.is_favorite) {
                    case true:   return "Address is favorite";
                    default:      return "Address not favorite";
                  }
                })()}
              </strong></span>
              </div>
            </div>
            <div class="row">
              <div class="col-md-2">
                <button className={`${classes.button} btn btn-info  btn-sm`} onClick={() => {
                           this.check_bookmark()
                        }
                      }>
                  Check Favorite
                </button>
              </div>
              <div class="col-md-2">
                <button disabled={!this.state.is_favorite}
                  className={`${classes.button} btn btn-warning  btn-sm`}
                  onClick={() => {
                    this.remove_bookmark()
                  }
                }
                >
                  Remove Favorite
                </button>
              </div>
              <div class="col-md-2">
                <button disabled={this.state.is_favorite}
                    className={`${classes.button} btn btn-success  btn-sm`}
                    onClick={() => {
                      this.add_bookmark()
                    }
                  }
                  >
                    Add Favorite
                  </button>
              </div>
            </div>
          </div>
          <div className={classes.mrgnbtm12px}>
            <h5><strong style={{paddingRight: '3px'}}>Comments</strong><button type="button" class="btn btn-default btn-sm"
                                                 onClick={() => {this.get_comments()}}>
                    Refresh
                  </button>
            </h5>
            <hr align="left" className={classes.lineBreak} />
            <div class="row" style={{marginLeft: "2px"}}>
              <div class="form-group col-md-12">
                <form onSubmit={this.handleSubmit}>
                  <label style={{width: '24em',paddingRight: '1em', fontWeight: "bold"}}>
                    Add Comment:
                    <input type="text" name="comment" class="form-control" onChange={this.handleChange} width="200px"/>
                  </label>
                  <input type="submit" class="btn btn-primary" value="Submit" />
                </form>
              </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                {
                  this.state.comments.map(function(comments_a, index){
                    return (
                      <ul><strong style={{marginLeft: '-2em'}}>{comments_a.address==('*'+ owner)? '*You': comments_a.address}</strong>
                        {
                          comments_a.comments.map(function(comment,index){
                            return (<li key={ comments_a.address+index.toString() }>{comment}</li>)
                          })
                        }
                      </ul>
                    );
                  })
                }
                </div>
            </div>
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
