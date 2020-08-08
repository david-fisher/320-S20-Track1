import {makeStyles} from '@material-ui/core';
import {isMobile} from 'react-device-detect';

const drawerWidth = (isMobile ? "100%" : "25%");

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  inputs: {
    marginLeft: "5%",
    marginRight: "5%",
    width:"90%"
  },
  fab: {
    position: 'fixed',
    top: theme.spacing(13),
    right: theme.spacing(1) * 4,
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  dayselect: {
    marginLeft: "40%"
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(2),
    marginTop: (isMobile ? 60 : 0)
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  filtersBar: {
    zIndex: theme.zIndex.drawer + 1,
    marginTop: 80,
    backgroundColor: "white"
  },
  rating: {
   align: "center",
   alignItems: "center",
  },
}));

export default useStyles;