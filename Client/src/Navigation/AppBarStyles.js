import { makeStyles } from "@material-ui/core"
import Cookies from "universal-cookie";

const cookies = new Cookies();
const role = cookies.get('role')
var primary_color="#881c1c"
if (role==='supporter'){
  primary_color="#003b5c"
}else if (role==='admin'){
  primary_color="#41273b"
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
      height: 80,
    },
    logo: {
      color: primary_color,
      fontSize: "255%",
      borderRadius: "40em",
      "&:hover": {
        backgroundColor: "#FFFFFF",
      },
    },
    button: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
  
      marginLeft: "1%",
      color: primary_color,
      fontSize: '120%',
      borderRadius: "40em",
      "&:hover": {
        backgroundColor: primary_color,
        color: "#FFF",
      },
    },
    pictureButton: {
      marginLeft: "1%",
      borderRadius: "100em",
      "&:hover": {
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

  export default useStyles