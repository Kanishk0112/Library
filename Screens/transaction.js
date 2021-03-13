import React from "react"
import{Text,TouchableOpacity,View,StyleSheet,Image,TextInput, Alert} from "react-native"
import * as Permissions from "expo-permissions"
import{BarCodeScanner} from "expo-barcode-scanner"
import db from "../Config"
export default class Transactionscreen extends React.Component{
    constructor(){
    super();
    this.state={
        hascamerapermission:null,
        scanned:false,
        scandata:"",
        Buttonstate:"normal",
        scannedbookid:"",
        scannedstudentid:"",
        transactionmessage:"",
    }
    }
    Handledtransaction=()=>{
    var transactionmessage= null
    db.collection("Books").doc( this.state.scannedbookid).get().then((doc)=>{
        var book= doc.data();
        if(book.Bookavailablity){
          this.Initiatebookissue();
          transactionmessage="bookissued"
        }
        else{
          this.initiatebookreturn();
          transactionmessage="bookreturned"
        }
    })
    this.setState({
      transactionmessage:transactionmessage
    })
    }
    Initiatebookissue=async()=>{
      db.collection("transactions").add({
        studentid:this.state.scannedstudentid,
        bookid:this.state.scannedbookid,
        Date:firebase.firestore.Timestamp.now().toDate(),
        transactiontype:"issue",
      })
      db.collection("Books").doc(this.state.scannedbookid).update({
        Bookavailablity:false
      })
      db.collection("Students").doc(this.state.scannedstudentid).update({
        Numberofbooksissued:firebase.firestore.FieldValue.incriment(1)
      })
      Alert.alert("bookissued")
      this.setState({
        scannedbookid:"",
        scannedstudentid:""
      })
    } 
    Initiatebookreturn=async()=>{
      db.collection("transactions").add({
        studentid:this.state.scannedstudentid,
        bookid:this.state.scannedbookid,
        Date:firebase.firestore.Timestamp.now().toDate(),
        transactiontype:"return",
      })
      db.collection("Books").doc(this.state.scannedbookid).update({
        Bookavailablity:true
      })
      db.collection("Students").doc(this.state.scannedstudentid).update({
        Numberofbooksissued:firebase.firestore.FieldValue.incriment(-1)
      })
      Alert.alert("bookreturned")
      this.setState({
        scannedbookid:"",
        scannedstudentid:""
      })
    }

getcamerapermissions=async(id)=>{
    const {status}=await Permissions.askAsync (Permissions.CAMERA)
    this.setState({
    hascamerapermission:status==="granted",
Buttonstate:id,
scanned:false
    })
}
handleBarcodeScan= async({type,data})=>{
    this.setState({
        scanned:true,
        Buttonstate:"normal",
        scandata:data
    })
}
    render(){
        const hascamerapermission= this.state.hascamerapermission;
        const scanned=this.state.scanned;
        const Buttonstate=this.state.Buttonstate
        if(Buttonstate!=="normal" && hascamerapermission){
            return(
                <BarCodeScanner 
                onBarCodeScanned= {scanned ? undefined :this.handleBarcodeScan}
                style={StyleSheet.absoluteFillObject} />
            )
        }
        else if(Buttonstate==="normal"){
        return(
            <View style={styles.Container}>
<View><Image source={require("../assets/booklogo.jpg")}
style={{width:200,height:200}}/>
<Text>Wireless Library</Text>
</View>
<View style= {styles.inputView}>
    <TextInput style={styles.inputBox}
    placeholder= "bookid"
    value={this.state.scannedbookid}/>
    <TouchableOpacity onPress={()=>{
        this.getcamerapermissions("bookid")
    }}><Text>Scan</Text></TouchableOpacity>
</View>
<View style= {styles.inputView}>
    <TextInput style={styles.inputBox}
    placeholder= "studentid"
    value={this.state.scannedstudentid}/>
      <TouchableOpacity onPress={()=>{
          this.getcamerapermissions("studentid")
      }}><Text>Scan</Text></TouchableOpacity>
</View>
                <Text style={styles.transactionAlert}>{this.state.transactionmessage}</Text>
               
                <TouchableOpacity style={styles.submitButton} onPress={
                    async()=>{
                        var trannsactionmessage=await this.Handledtransaction();
                    }
                }><Text style={styles.submitButtonText}>Submit</Text></TouchableOpacity>
            </View>
        )}
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });