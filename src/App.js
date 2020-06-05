import  React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';
import Particles from 'react-particles-js';



//////////ANIMATED BACKGROUND//////
const particleOptions={
  particles: {
        number:{
          value:80,
          density:{
            enable:true,
            value_area:800
          }
        },
       
      }
    };

const initialState={
      input:'',
      imgUrl:'',
      box:{},
      route:'signin',
      isSignedin:false,
      user:{
        'id':'',
        'name':'',
        'email':'',
        'entries':0,
        'joined':''
      }
}
class App extends Component {
  constructor(){
    super();
    this.state=initialState
    
  }
loadUser=(data)=>{
  this.setState({user:{
    id:data.id,
    name:data.name,
    email:data.email,
    password:data.password
  }})

}
  ////////////CONNECTING FRONT-END//////////

  onInputChange=(event)=>{
    this.setState({input:event.target.value});
  }
  //////////////  calculating the faces boundries to create boxes around face////////
  calculateFaceLocation=(data)=>{
    const clarifaiData=data.outputs[0].data.regions[0].region_info.bounding_box;
    const getImage=document.getElementById('inputimage');
    const width=Number(getImage.width);
    const height=Number(getImage.height);
    return{
      leftCol:clarifaiData.left_col*width,
      topRow:clarifaiData.top_row*height,
      rightCol:width-(clarifaiData.right_col*width),
      bottomRow:height-(clarifaiData.bottom_row*height)

    };
  }
  displayBoundingBox=(box)=> {
   
    this.setState({box:box});

  }

  onButtonSubmit=()=>{
    this.setState({imgUrl:this.state.input});
    fetch('https://shrouded-beach-94957.herokuapp.com/imageurl',{
          method:"post",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            input:this.state.input
          })})
    .then(response=>response.json())
    .then(response=>{
      if(response){
        fetch('https://shrouded-beach-94957.herokuapp.com/image',{
          method:"put",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            id:this.state.user.id
          })})
    .then(response=>response.json())
    .then(count=>{
      this.setState(Object.assign(this.state.user,{entries:count}))
    })
    .catch(console.log)
      }
       this.displayBoundingBox(this.calculateFaceLocation(response))
      
      })

    .catch(err=> console.log("Error is here",err));
    
  
  }

  ////////////////ROUTE CHANGE METHOD/////////////
  onRouteChange=(route)=>{
    if(route==='signout'){
      this.setState(initialState);
    }
    else if(route==='home'){
      this.setState({isSignedin:true})
    }
    this.setState({route:route})
  }
  render(){ 
    const {isSignedin,imgUrl,route,box} = this.state;
  return (
    <div className="App">
       <Particles 
        className='particle'
        params={particleOptions} />
      <Navigation isSignedin={isSignedin} onRouteChange={this.onRouteChange}/>
      
      {
      route==='home'?
      <div>
        <Logo/>
        <Rank
        name={this.state.user.name}
        entries={this.state.user.entries}
        />
        <ImageLinkForm 
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imgUrl={imgUrl}/>
      </div>
      :
      (
        route==='signin'?
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
    
  }  
     
    </div>
  );
  }
}

export default App;
