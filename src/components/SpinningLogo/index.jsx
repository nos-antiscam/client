import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";

import nosLogo from "./../../assets/antiscam.png";

const styles = {
  logoContainer: {
    display: "block",
    maxWidth: "200px",
    margin: "32px auto",
    position: "relative"
  },
  nosLogo: {
    width: "100%"
  },
  "@keyframes nOS-logo-spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" }
  }
};

const SpinningLogo = ({ classes }) => (
  <div className={classes.logoContainer}>
    <img src={nosLogo} className={classes.nosLogo} alt="nOS logo" key="nosLogo" />
  </div>
);

SpinningLogo.propTypes = {
  classes: PropTypes.object.isRequired
};

export default injectSheet(styles)(SpinningLogo);
