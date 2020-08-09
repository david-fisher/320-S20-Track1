import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    AppBar,
    Avatar,
    Toolbar,
    Typography,
    MenuItem,
    Button,
    Menu,
    Link,
    Dialog,
} from '@material-ui/core';
// import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Cookies from 'universal-cookie';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const cookies = new Cookies();
const role = cookies.get('role');
var primary_color = '#881c1c';
if (role === 'supporter') {
    primary_color = '#003b5c';
} else if (role === 'admin') {
    primary_color = '#41273b';
}

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
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
    logo: {
        color: primary_color,
        fontSize: '255%',
        borderRadius: '40em',
        '&:hover': {
            backgroundColor: '#FFFFFF',
        },
    },
    button: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),

        marginLeft: '1%',
        color: primary_color,
        fontSize: '120%',
        borderRadius: '40em',
        '&:hover': {
            backgroundColor: primary_color,
            color: '#FFF',
        },
    },
    pictureButton: {
        marginLeft: '1%',
        borderRadius: '100em',
        '&:hover': {
            backgroundColor: primary_color,
        },
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    spacer: {
        flexGrow: 1,
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function MenuAppBar(props) {
    const [PossibleRoles, SetPossibleRoles] = React.useState([]);
    //Gets info from the session
    const name = sessionStorage.getItem('firstName');
    const id = sessionStorage.getItem('id');
    const image = sessionStorage.getItem('image');

    //Sets the styling
    const classes = useStyles();

    //To handle the drop down menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [openModal, setOpen] = React.useState(false);

    useEffect(() => {
        fetch(
            'https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/' +
                id +
                '/role'
        )
            .then(res => res.json())
            .then(json => {
                sessionStorage.setItem('possibleRoles', [
                    'student',
                    'supporter',
                    'admin',
                ]);
                //console.log(json.user_roles)
                //console.log("setting possible roles to: " + json.user_roles);
                SetPossibleRoles(json.user_roles);
            })
            .catch(error => {
                //console.log(error);
                //console.log("No Supporters Found");
            });
    }, [id]);

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
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('firstName');
        sessionStorage.removeItem('lastName');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('image');
        cookies.remove('role');
        sessionStorage.removeItem('token');
        window.location.reload();
    }
    const SwitchUserHandle = event => {
        if (event.currentTarget.id === 'student') {
            cookies.set('role', 'Student');
        } else {
            cookies.set('role', event.currentTarget.id);
        }
        if (cookies.get('role') === 'Student') {
            window.location.reload('/');
        }
        window.location.reload('/appointments');
    };
    function renderRolesInModal() {
        let RenderRoles = [];
        if (PossibleRoles.length === 1) {
            RenderRoles = <h2>Sorry, You just have 1 role.</h2>;
        } else {
            for (var i = 0; i < PossibleRoles.length; i++) {
                var RoleName = '';
                RoleName =
                    PossibleRoles[i].charAt(0).toUpperCase() +
                    PossibleRoles[i].slice(1);

                if (PossibleRoles[i] === role.toLowerCase()) {
                    continue;
                }

                RenderRoles.push(
                    <Button
                        key={i}
                        className={classes.button}
                        id={PossibleRoles[i]}
                        color="primary"
                        onClick={SwitchUserHandle}
                        style={{ marginLeft: '10px', marginRight: '10px' }}
                    >
                        {RoleName}
                    </Button>
                );
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
                    <Typography className={classes.spacer}></Typography>
                    {role.toLowerCase() === 'student' && (
                        <Button
                            variant="text"
                            href="/"
                            className={classes.button}
                        >
                            Create Appointment
                        </Button>
                    )}
                    <Button
                        variant="text"
                        href="/appointments"
                        className={classes.button}
                    >
                        My Appointments
                    </Button>
                    <Button
                        variant="text"
                        href="/FAQ"
                        className={classes.button}
                    >
                        FAQ
                    </Button>
                    <Button
                        className={classes.pictureButton}
                        onClick={handleMenu}
                    >
                        <Avatar
                            alt={name}
                            src={image}
                            className={classes.large}
                        ></Avatar>
                    </Button>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
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

                        {role.toLowerCase() === 'admin' && (
                            <MenuItem onClick={handleClose}>
                                <Link href="/admin-settings">
                                    <Typography component="h6" variant="h6">
                                        Admin Settings
                                    </Typography>
                                </Link>
                            </MenuItem>
                        )}
                        {role.toLowerCase() === 'supporter' && (
                            <MenuItem onClick={handleClose}>
                                <Link href="/supporter-settings">
                                    <Typography component="h6" variant="h6">
                                        Supporter Settings
                                    </Typography>
                                </Link>
                            </MenuItem>
                        )}

                        {PossibleRoles.length !== 1 && (
                            <MenuItem onClick={handleModalOpen}>
                                <Link>
                                    <Typography component="h6" variant="h6">
                                        Switch Role
                                    </Typography>
                                </Link>
                            </MenuItem>
                        )}
                        <Dialog
                            open={openModal}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={handleModalClose}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                        >
                            <DialogTitle id="alert-dialog-slide-title">
                                {'Choose role'}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-slide-description">
                                    Given below are the list of the roles that
                                    you have been registered as. Select the role
                                    you want to switch to.
                                </DialogContentText>
                                <div style={{ textAlign: 'center' }}>
                                    {renderRolesInModal()}
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    className={classes.button}
                                    onClick={handleModalClose}
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>

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
