import React, { useEffect, useRef, useState ,useCallback} from 'react';
import { View,Text,StyleSheet,TouchableOpacity,Image} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Camera,useCameraDevice} from 'react-native-vision-camera';
import CustomAlert from '../CustomAlert';
import { useSelector, useDispatch } from 'react-redux';
import { addMedia } from '../../redux/actions';

const App = ()=>{
    const [showCamera,setShowCamera] = useState(true);
    const [showPreview,setShowPreview] = useState(false);
    const [src,setSrc] = useState('');
    const [cameraType, setCameraType] = useState('back');
    const [mode, setMode] = useState('photo');
    const device = useCameraDevice(cameraType);
    const number = useSelector((state)=>state.number);
    const media = useSelector((state)=>state.media);
    const dispatch = useDispatch();
    const camera = useRef(null);

    const saveMedia = (oldPath,type) => {
      setShowPreview(false);
      const d = new Date().toISOString();
      const date = d.replace(/[:.-]/g,'_');
      const ext = type == 'image'? '.jpg': '.mp4';
      const newPath = RNFS.DocumentDirectoryPath + '/Hebatullah_'+ date + ext;
      RNFS.copyFile(oldPath,newPath).then(()=>{console.log('file saved')}).catch((error)=>{console.log(error)});
      const file = {
        id : number,
        src: newPath,
        type: type,
      }
      dispatch(addMedia(file));
    }

    const AlertContent = () =>{
      return(
        <View style={style.container}>
          <Image style={style.img} source={{ uri: 'file://'+src}}></Image>
          <View style={style.btnContainer}>
            <TouchableOpacity  style={style.btn} onPress={()=>{saveMedia(src,'image')}}><Text style={style.text}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={style.btn} onPress={()=>{setShowPreview(false)}}><Text  style={style.text}>Discard</Text></TouchableOpacity>
          </View>
        </View>
      );
    }
    useFocusEffect(
        useCallback(() => {
          setShowCamera(true);
          return () => {
            setShowCamera(false);
          };
        }, [])
    );
    useEffect(()=>{
      console.log(media);
      const checkCameraPermission = async () => {
      const permission = Camera.requestCameraPermission();
      };
      checkCameraPermission();
    },[]);

    const takeAPhoto = async()=>{
      try{
        const photo = await camera.current.takePhoto();
        setShowPreview(true);
        setSrc(photo.path);
      }
      catch(err){
        console.log('error while taking a photo' + err);
      }
    }
    const takeAVideo = async()=>{
        camera.current.startRecording({
          onRecordingFinished: (video) => {
            saveMedia(video.path, 'video');
          },
          onRecordingError: (error) => console.error(error),
        });
    }
    const stopRecording = async () =>{
      await camera.current.stopRecording();
    }
    const capture = ()=>{
      if(mode == 'photo'){
        takeAPhoto();
      }
      else if (mode == 'video'){
        setMode('recording');
        takeAVideo();
      }
      else if(mode == 'recording'){
        stopRecording();
        setMode('video');
      }
    }
    const changeCamera =()=>{
      cameraType == 'back'? setCameraType('front') : setCameraType('back');
    }
    const changeMode=()=>{
      mode == 'photo'? setMode('video') : setMode('photo');
    }
    return (
        <View style={StyleSheet.absoluteFill}>
            <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            ref={camera}
            photo={true}
            video={true}
            />
            <TouchableOpacity  onPress={capture} style={style.capture}></TouchableOpacity>
            <TouchableOpacity onPress={changeCamera} style={style.switch}><Text style={style.text}>switch</Text></TouchableOpacity>
            <TouchableOpacity onPress={changeMode} style={style.mode}><Text style={style.text}>{mode}</Text></TouchableOpacity>
            <CustomAlert show={showPreview} setShow={setShowPreview} content={<AlertContent src={src}/>}/> 
        </View>
    );
}
const style = StyleSheet.create({
    container:{
      backgroundColor:'#355c5c',
      padding:20,
      borderRadius:20,
    },
    text:{
        fontSize:18,
        color:'white',
        alignSelf:'center'
    },
    capture:{
      backgroundColor:'white',
      alignSelf:'center',
      position:'absolute',
      bottom:20,
      padding:20,
      borderRadius:50,
      width:85,
      height:85,
      borderWidth:6,
      borderColor:'gray',
      opacity:0.8,
    },
    img:{
      width:330,
      height:500,
      borderRadius:20,
    },
    btnContainer:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-around',
      paddingTop:10,
    },
    btn:{
      backgroundColor:'#183D3D',
      padding:8,
      width:100,
      borderRadius:10,
    },
    switch:{
      backgroundColor:'white',
      left:10,
      position:'absolute',
      bottom:20,
      padding:10,
      borderRadius:50,
      width:95,
      borderWidth:6,
      borderColor:'gray',
      opacity:0.8,
    },
    mode:{
      backgroundColor:'white',
      right:10,
      position:'absolute',
      bottom:20,
      padding:10,
      borderRadius:50,
      width:95,
      borderWidth:6,
      borderColor:'gray',
      opacity:0.8,
    }
});
export default App;