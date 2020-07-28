import React , {useEffect} from "react"
import {makeStyles, Typography, Button, Container, CircularProgress, TextField, Grid} from "@material-ui/core";
import {Autocomplete} from '@material-ui/lab';
import SupporterTypes from './SupporterTypes.js'
import SubmitButton from './SubmitButton.js'

const useStyles = makeStyles(theme => ({
    paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    form: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
      padding: 4
    },
    button: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
    }
}));

function extractSpecializationTypesArray(spec){
    var arr=[]
    if(!spec){
        return arr
    }
    for(let i=0;i<spec.length;i++){
        var ar=[]
        ar.push(spec[i]["specialization_type"])
        ar.push(spec[i]["duration"])
        ar.push(spec[i]["max_students"])
        arr.push(ar)
    }
    //console.log(arr)
    return arr
}

function extractSpecializationTypes(spec){
    var arr=[]
    if(!spec){
        return arr
    }
    for(let i=0;i<spec.length;i++){
        arr.push(spec[i]["specialization_type"])
    }
    return arr
}

function extractSpecializationNames(spec){
    var arr=[]
    if(!spec){
        return arr
    }
    for(let i=0;i<spec.length;i++){
        arr.push(spec[i]["specialization_type"])
    }
    return arr
}

function extractTags(tags){
    var arr=[]
    if (!tags){
        return arr
    }
    for(let i=0;i<tags.length;i++){
        arr.push(tags[i].tag_type)
    }
    //console.log(arr)
    return arr
}

function extractSupporterTypes(settings){
    var arr = []
    if(settings.professional_staff)
        arr.push("Professional Staff")
    if(settings.student_staff)
        arr.push("Student Staff")
    if(settings.alumni)
        arr.push("Alumni")
    if(settings.faculty)
        arr.push("Faculty")
    if(settings.other)
        arr.push("Other")
    return arr
}

const ProfileInformation = (props) => {
    const classes=useStyles();
    const {settings} = props
    const [error, setError] = React.useState(false)
    const spec_types = extractSpecializationTypesArray(settings.appointment_type_info ? settings.appointment_type_info : [] )
    const supporter_types=extractSupporterTypes(settings)
    const [supporterTypes, setSupporterTypes]=React.useState(supporter_types);
    const [teams, setTeams]=React.useState(settings.team_name);
    const [office, setOffice]=React.useState(settings.office);
    const [employer, setEmployer]=React.useState(settings.employer);
    const [title, setTitle]=React.useState(settings.title);
    const [tags, setTags]=React.useState(settings.tags ? settings.tags : [])
    const [tagsList, setTagsList]=React.useState([])
    const [typesList, setTypesList]=React.useState([])
    const [loaded, setLoaded]=React.useState(false)
    const [majorList, setMajorList] = React.useState([])
    const [prefMajors, setPrefMajors]=React.useState(extractMajors(settings.major_preferences))
    const [minorList, setMinorList] = React.useState([])
    const [prefMinors, setPrefMinors]=React.useState(extractMinors(settings.minor_preferences))
    const types_list = extractSpecializationNames(settings.appointment_type_info ? settings.appointment_type_info : [] )
    const [specializations, setSpecializations]=React.useState(types_list);


    //console.log(settings.specialization_types)
    console.log(settings.appointment_type_info)

    console.log(specializations)

    function extractMajors(m){
        if(m === undefined){
          return []
        }
        var arr=[]
        for(let i=0;i<m.length;i++){
          arr.push(m[i].major)
        }
        return arr
    }

    function extractMinors(m){
        if(m === undefined){
          return []
        }
        var arr=[]
        for(let i=0;i<m.length;i++){
          arr.push(m[i].minor)
        }
        return arr
    }

    function changeSpecs(v){
        for(let i=0;i<v.length;i++){
            if(!settings.appointment_type_info[v[i]]){
                settings.appointment_type_info[v[i]]=[v[i],30,1]
            }
        }
        console.log(specializations)
        setSpecializations(v)

    }

    useEffect(() => {
        //fetchSupporterList(initial_fetch_url);
        setLoaded(false);
        Promise.all([fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/tags"), 
        fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/specialization-types"),
        fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/majors"),
        fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/minors")])
  
        .then(([res1, res2, res3, res4]) => { 
           return Promise.all([res1.json(), res2.json(), res3.json(), res4.json()]) 
        })
        .then(([res1, res2, res3, res4]) => {
            if(res1.tags && res2.specialization_types && res3.majors && res4.minors ){
                setTagsList(extractTags(res1.tags));
                setTypesList(extractSpecializationTypes(res2.specialization_types));
                setMajorList(extractMajors(res3.majors))
                setMinorList(extractMinors(res4.minors))
                //console.log(res2)
                setLoaded(true);
            }else{
          throw new Error()
        }
      })
      .catch(error => {
        setError(true)
        setLoaded(true);
        console.log("Error Connectting to API")
      });
      }, [])

    //console.log(tagsList)
    //console.log(typesList)

    if(error){
        return (
          <div align="center">
            <br/>
            <br/>
            <br/>
            <Typography variant="h4">There was an error fetching your settings</Typography>
          </div>
        )
      }
    
      else if(!loaded){
        return (
          <div align="center">
            <br></br>
            <Typography variant="h4">Loading...</Typography>
            <br></br>
            <CircularProgress />
          </div>
        )
    }
    
    return (
        <Container component="main">
        <div className={classes.paper}>
            <Typography component="h1" variant="h5">
                Supporter Information
            </Typography>
            <form className={classes.form}>
                <Grid container>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Current Employer"
                            autoFocus
                            defaultValue={employer}
                            form className={classes.form}
                            onChange={e => setEmployer(e.target.value)}
                        />   
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Title"
                            autoFocus
                            defaultValue={title}
                            form className={classes.form}
                            onChange={e => setTitle(e.target.value)}
                        />   
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Team"
                            autoFocus
                            defaultValue={teams}
                            form className={classes.form}
                            onChange={e => setTeams(e.target.value)}
                        />   
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Office"
                            autoFocus
                            defaultValue={office}
                            form className={classes.form}
                            onChange={e => setOffice(e.target.value)}
                        />   
                    </Grid>
                </Grid>
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={SupporterTypes}
                    defaultValue={supporterTypes}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Supporter Types"
                    />
                    )}
                    onChange={(e,v) => setSupporterTypes(v)}
                />
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={typesList}
                    defaultValue={types_list}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Help Needed Topics"
                    />
                    )}
                    onChange={(e,v) => setSpecializations(v)}
                />

                <Autocomplete
                    multiple
                    className={classes.form}
                    options={tagsList}
                    defaultValue={tags}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Supporter Specialities"
                    />
                    )}
                    onChange={(e,v) => setTags(v)}
                />
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={majorList}
                    defaultValue={prefMajors}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Preferred Majors"
                    />
                    )}
                    onChange={(e,v) => setPrefMajors(v)}
                />
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={minorList}
                    defaultValue={prefMinors}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Preferred Minors"
                    />
                    )}
                    onChange={(e,v) => setPrefMinors(v)}
                />
                <SubmitButton 
                    specializations={specializations} 
                    supporter_types={supporter_types}
                    teams={teams} 
                    employer={employer}
                    title={title} 
                    tags={tags} 
                    office={office}
                    specializations_json={settings.appointment_type_info}
                    prefMajors={prefMajors} 
                    prefMinors={prefMinors}>
                </SubmitButton>
            </form>
        </div>
        </Container>
    );
}

export default ProfileInformation;
