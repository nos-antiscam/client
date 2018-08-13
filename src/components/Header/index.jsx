import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";

import SpinningLogo from "./../SpinningLogo";

const styles = {
  header: {
    color: "#333333",
    padding: "8px",
    marginBottom: "16px"
  },
  title: {
    fontSize: "1.5em",
    textAlign: "center"
  }
};

const Header = ({ classes, title }) => (
  <header className={classes.header}>
    <h1 className={classes.title}><strong>{title}</strong></h1>
    <SpinningLogo/>
  </header>
);

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
};

export default injectSheet(styles)(Header);
