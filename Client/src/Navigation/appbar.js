import React, { useEffect } from "react";
import useStyles from "./AppBarStyles"
import {AppBar, Avatar, Toolbar, ListItemIcon, ListItemText, Typography, MenuItem, Button, Menu, Link,Dialog} from "@material-ui/core";
// import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Cookies from "universal-cookie";
import {isMobile} from 'react-device-detect';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import UpdateIcon from '@material-ui/icons/Update';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import ContactsIcon from '@material-ui/icons/Contacts';
import HelpIcon from '@material-ui/icons/Help';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const cookies = new Cookies();
const role = cookies.get('role')

export default function MenuAppBar(props) {

  const [PossibleRoles,SetPossibleRoles] = React.useState([]);
  //Gets info from the session 
  const token = sessionStorage.getItem("token");
  const name = sessionStorage.getItem("firstName");
  const id = sessionStorage.getItem("id");
  const image = sessionStorage.getItem("image")

  //Sets the styling
  const classes = useStyles();

  //In order to only show the toolbar when authorized
  const [auth, setAuth] = React.useState(token !== undefined);

  //To handle the drop down menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [openModal, setOpen] = React.useState(false);

  
  useEffect(() => {
    fetch('https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/' + id + '/role')
        .then(res => res.json())
        .then(json => {
          sessionStorage.setItem('possibleRoles', ['student','supporter', 'admin']);
          //console.log(json.user_roles)
          //console.log("setting possible roles to: " + json.user_roles);
          SetPossibleRoles(json.user_roles);
        })
        .catch(error => {
            //console.log(error);
            //console.log("No Supporters Found");
        });
      }, [])
    
  const handleModalOpen = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };
  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
    
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  //Function that handles log out by deleting the cookie and reloading
  function logout() {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("firstName");
    sessionStorage.removeItem("lastName");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("image");
    cookies.remove("role");
    sessionStorage.removeItem("token");
    window.location.reload();
  }
 function renderNavBarButtonsBasedOnRole(){
   let RenderButtons=[];
   if(role.toLowerCase()=='student'){
     return(<div style={{width:'40%',float:'right'}}><Button variant="text" href="/match" className={classes.button}>Create Appointment</Button>
     <Button variant="text" href="/appointments" className={classes.button}>My Appointments</Button>
     <Button variant="text" href="/FAQ" className={classes.button}>FAQ</Button></div>);
   }
    return(<div style={{width:'300px',float:'right'}}>>
    <Button variant="text" href="/appointments" className={classes.button}>My Appointments</Button>
    <Button variant="text" href="/FAQ" className={classes.button}>FAQ</Button></div>);
 }
 const SwitchUserHandle= event =>{
  if(event.currentTarget.id=='student'){
    cookies.set('role', "Student")
  }
  else{
  cookies.set('role',event.currentTarget.id);
  }
  if(cookies.get('role')==='Student'){
    window.location.reload('/');
  }
 window.location.reload('/appointments');
 }
 function renderRolesInModal(){
  let RenderRoles=[];
  if(PossibleRoles.length==1){
    RenderRoles=(<h2>Sorry, You just have 1 role.</h2>);
  }
  else{
    
    for(var i=0;i<PossibleRoles.length;i++){
      var RoleName='';
      RoleName=PossibleRoles[i].charAt(0).toUpperCase() + PossibleRoles[i].slice(1);
     
      if(PossibleRoles[i]==role.toLowerCase()){
        continue;
      }
    
      
      RenderRoles.push((<Button key={i} className={classes.button}
        id={PossibleRoles[i]}
        color="primary"
        onClick={SwitchUserHandle}
        style={{marginLeft:'10px',marginRight:'10px'}}
      >
        {RoleName}
       </Button>
     ));
    }
  }
return RenderRoles;
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
          {role.toLowerCase()==='student' && !isMobile &&
            <Button variant="text" href="/" className={classes.button}>Create Appointment</Button>
          }
          {!isMobile &&
           <>
            <Button variant="text" href="/appointments" className={classes.button}>My Appointments</Button>
            <Button variant="text" href="/FAQ" className={classes.button}>FAQ</Button>
            </>
          }
          <Button className={classes.pictureButton} onClick={handleMenu}>
            <Avatar alt={name} 
              src={image}
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
            {role.toLowerCase()==='student' && isMobile && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AddIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/">
                    <Typography component="h6" variant="h6">
                      Create Appointment
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {isMobile && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <ContactsIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/appointments">
                    <Typography component="h6" variant="h6">
                      My Appointments
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {isMobile && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <HelpIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/FAQ">
                    <Typography component="h6" variant="h6">
                      FAQ
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {role.toLowerCase()!=='admin' && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircleIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/account">
                    <Typography component="h6" variant="h6">
                      My Account
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {role.toLowerCase()==='admin' && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <SettingsIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/admin-settings">
                    <Typography component="h6" variant="h6">
                      Admin Settings
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {role.toLowerCase()==='supporter' && (
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <SettingsIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link href="/supporter-settings">
                    <Typography component="h6" variant="h6">
                      Supporter Settings
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            {(PossibleRoles.length>1) && (
              <MenuItem onClick={handleModalOpen}>
                <ListItemIcon>
                  <UpdateIcon/>
                </ListItemIcon>
                <ListItemText>
                  <Link>
                    <Typography component="h6" variant="h6">
                      Switch Role
                    </Typography>
                  </Link>
                </ListItemText>          
              </MenuItem>
            )}
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <ExitToAppIcon/>
              </ListItemIcon>
              <ListItemText>
                <Link href="/login">
                  <Typography component="h6" variant="h6">
                    Log Out
                  </Typography>
                </Link>
              </ListItemText>   
            </MenuItem>
          </Menu>
            <Dialog
            open={openModal}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleModalClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle id="alert-dialog-slide-title">{"Choose role"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                Given below are the list of the roles that you have been registered as. Select the role you want to switch to.
              </DialogContentText>
              <div style={{textAlign:'center'}}>
              {renderRolesInModal()}
              </div>
            </DialogContent>
            <DialogActions>
              
              <Button className={classes.button} onClick={handleModalClose} >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </div>
  );
}