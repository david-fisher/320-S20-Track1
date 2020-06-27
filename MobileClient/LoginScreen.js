import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Button } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { Auth } from "aws-amplify";
import App from './App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { setCustomText, setCustomTextInput } from 'react-native-global-props';

export default function LoginScreen() {
    Feather.loadFont();
    const press = false;
    const [passwordVisible, setPasswordVisible] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [icon, setIcon] = useState("eye-off");
    AppRegistry.registerComponent(appName, () => App);

    //Uncomment whenever you have added Open-Sans-Light 
    // const customTextProps = {
    //     style: {
    //         fontFamily: 'OpenSans-Light'
    //     }
    // }

    // setCustomText(customTextProps);
    // setCustomTextInput(customTextProps);

    Amplify.configure({
        Auth: {
            mandatorySignIn: true,
            region: 'us-east-2',
            userPoolId: 'us-east-2_TOeWJwIy0',
            userPoolWebClientId: '7phnpqt6kfvfr9apoelke4hhm1'
        }
    });

    const handleSubmit = async event => {
        event.preventDefault();
        var username = email;
        try {
            const user = await Auth.signIn(email, password);
            console.log(user);
            if (user.signInUserSession.accessToken !== undefined) {

                var authToken = user.signInUserSession.idToken.jwtToken;
                var base64Url = authToken.split('.')[1];
                var json = JSON.parse(window.atob(base64Url));
                const cookies = new Cookies();
                sessionStorage.setItem("token", user.signInUserSession.accessToken, { path: "/" });
                sessionStorage.setItem("email", json.email);
                sessionStorage.setItem("firstName", json.given_name);
                sessionStorage.setItem("lastName", json.family_name);
                sessionStorage.setItem("role", "Student");
                sessionStorage.setItem("id", json.preferred_username);
                cookies.set("role", "Student", { path: "/" });
                fetchPicture()
            }
        } catch (error) {
            if (error.code == "NotAuthorizedException") {
                setValidInfo(false);
            }
            else {
                alert(error.message)
            }
            console.log(error);
        }
    }

    function handlePress() {
        setIcon(passwordVisible ? "eye" : "eye-off");
        setPasswordVisible(!passwordVisible);
    }

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    return (
        <View style={styles.container}>

            <Image source={require('./images/reachout.png')} style={{ width: 210, height: 210 }} />
            <View style={styles.action}><TextInput style={styles.input} placeholder={"Email"} keyboardType={'email-address'} placeholderTextColor='grey' name={email} autoCompleteType="email" onChangeText={text => setEmail(text)} onChange={validateForm} />
            </View>
            <View style={styles.action}><TextInput style={styles.input} placeholder={"Password"} secureTextEntry={passwordVisible} placeholderTextColor='grey' name={password} onChangeText={text => setPassword(text)} onChange={validateForm} />
                <TouchableOpacity onPress={handlePress}>
                    <Feather style={styles.icons}
                        name={icon}
                        color="grey"
                        size={20}
                    />
                </TouchableOpacity>

            </View>
            <TouchableOpacity style={styles.loginButton} disabled={!validateForm()} onPress={handleSubmit}>
                <Text style={styles.text}>
                    Login
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.passwordContainer}>
                <Text style={styles.passwordText}>
                    Forgot Password
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton}>
                <Text style={styles.signupText}>
                    Don't have an account? Sign Up
                </Text>
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButton: {
        marginTop: 20,
        marginBottom: 10,
        padding: 18,
        backgroundColor: 'maroon',
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        shadowColor: 'rgba(0,0,0, .8)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 2, //IOS
        elevation: 2 // Android
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    icons: {
        marginTop: 20
    },
    input: {
        flex: 1,
        marginTop: 10,
        marginBottom: 5,
        padding: 10,
        backgroundColor: 'white',
        width: '100%',
        fontSize: 14,
        color: "black"
    },
    text: {
        fontWeight: '500',
        color: 'white',
        fontSize: 17,
    },
    signupButton: {
        marginTop: 30,
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
    },
    signupText: {
        textAlign: 'left',
        fontWeight: '500',
        color: 'maroon',
        fontSize: 17,

    },
    passwordContainer: {

        borderRadius: 8,
        width: "100%"
    },
    passwordText: {
        padding: 5,
        textAlign: 'right',
        fontWeight: '500',
        color: 'maroon',
        fontSize: 15,
    }

});
