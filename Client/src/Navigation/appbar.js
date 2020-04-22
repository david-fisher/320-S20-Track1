import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {AppBar, Avatar, Toolbar, Typography, IconButton, Switch, MenuItem, Button, ButtonGroup, Grid, Menu, Link} from "@material-ui/core";
import Cookies from "universal-cookie";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 30,
      }, 
    }, 
  }, 
  menuButton: {
    flexGrow: 1,
  },
  bar: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    minHeight: 80,
  },
  logo:{
    color: '#881c1c',
    fontSize: '255%',
    borderRadius: "40em",
    '&:hover': {
      backgroundColor: '#FFFFFF',
    }
  },
  button: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    marginLeft: "1%",
    color: '#881c1c',
    fontSize: '120%',
    borderRadius: "40em",
    '&:hover': {
      backgroundColor: '#881c1c',
      color: '#FFF'
    }
  },
  pictureButton: {
    marginLeft: "1%",
    borderRadius: "100em",
    '&:hover': {
          backgroundColor: '#881c1c',
        },
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  spacer: {
    flexGrow: 1,
  },
}));
const styles = {
  button: {
    width: 64, height: 64,
    padding: 0,
  },
  icon: {
    width: 64, height: 64,
  },
};
export default function MenuAppBar() {

  //Gets info from the cookies
  const cookies = new Cookies();
  const token = cookies.get("token");
  const name = cookies.get("firstName");
  const role = cookies.get("role");
  //Sets the styling
  const classes = useStyles();

  //In order to only show the toolbar when authorized
  const [auth, setAuth] = React.useState(token !== undefined);

  //To handle the drop down menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //Function that handles log out by deleting the cookie and reloading
  function logout() {
    cookies.remove("email");
    cookies.remove("firstName");
    cookies.remove("lastName");
    cookies.remove("role");
    cookies.remove("token");
    cookies.remove("id");
    window.location.reload();
  }

  //First button is to link back to home. The rest is the drop down menu from the user icon, and handles the routing.
  return (
    <div className={classes.root}>
      <AppBar position="static" color="secondary" className={classes.bar}>
        <Toolbar>
          <Button href="/match" className={classes.logo}>
             ReachOUT
          </Button>
          <Typography className={classes.spacer}>
          </Typography>
          <Button variant="text" href="/" className={classes.button}>Find A Supporter</Button>
          <Button variant="text" href="/appointments" className={classes.button}>Appointments</Button>
          <Button variant="text" href="/FAQ" className={classes.button}>FAQ</Button>
          <Button className={classes.pictureButton} onClick={handleMenu}>
            <Avatar alt={name} 
              src="https://www.cics.umass.edu/sites/default/files/styles/people_individual/public/headshots/img_4695_copy.jpg?itok=jwwJF0KP"
              className={classes.large}>
            </Avatar>
          </Button>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Link href="/account">
                <Typography component="h6" variant="h6">
                  My Account
                </Typography>
              </Link>
            </MenuItem>

              {/* {role==="Admin" && (
                <MenuItem onClick={handleClose}>
                  <Link href="/admin-settings">
                    <Typography component="h6" variant="h6">
                      Admin Settings
                    </Typography>
                  </Link>
                </MenuItem>
              )} */}
              
            <MenuItem onClick={handleClose}>
              <Link href="/admin-settings">
                <Typography component="h6" variant="h6">
                  Admin Settings
                </Typography>
              </Link>
            </MenuItem>
            

            {role==="Supporter" && (
              <MenuItem onClick={handleClose}>
                <Link href="/supporter-settings">
                  <Typography component="h6" variant="h6">
                    Supporter Settings
                  </Typography>
                </Link>
              </MenuItem>
            )}

            <MenuItem onClick={handleClose}>
              <Link href="/feedback">
                <Typography component="h6" variant="h6">
                  Feedback
                </Typography>
              </Link>
            </MenuItem>

            <MenuItem onClick={logout}>
              <Link href="/login">
                <Typography component="h6" variant="h6">
                  Log Out
                </Typography>
              </Link>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
}
