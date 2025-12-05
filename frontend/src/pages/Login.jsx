import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon,
  MDBCheckbox
}
from 'mdb-react-ui-kit';

function Register() {
  const navigate = useNavigate()
  const [formData , setformData] = useState({
    name:"",
    email:"",
    passwordHash:""
  });
  console.log(formData)

  const handleLogin = async(e)=>{
    e.preventDefault();
    try{
      const response  = await axios.post('https://split-ex-backend.vercel.app/login',formData)
      if( response.status == 200){
        const token = response.data.token
        localStorage.setItem("token",token);

        const verify = await axios.get('https://split-ex-backend.vercel.app/profile',
          
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        )
        if( verify.status == 200){
          navigate('/profile');
        }
        else{
          console.log("Token is not matched")
          alert("Token is not matched")
        }
      }
    }
    catch(error){
      console.log(error)
      alert("Something went wrong")
    }
  }
  return (
    <MDBContainer fluid>

      <MDBCard className='text-black m-5' style={{borderRadius: '25px'}}>
        <MDBCardBody>
          <MDBRow>
            <MDBCol md='10' lg='6' className='order-2 order-lg-1 d-flex flex-column align-items-center'>

              <p classNAme="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Log in</p>

              <div className="d-flex flex-row align-items-center mb-4 ">
                <MDBIcon fas icon="user me-3" size='lg'/>
                <MDBInput label='Your Name' id='form1' type='text' className='w-100' 
                onChange={(e)=>setformData({...formData , name:e.target.value})}
                />
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="envelope me-3" size='lg'/>
                <MDBInput label='Your Email' id='form2' type='email'
                onChange={(e)=>setformData({...formData , email:e.target.value})}
                />
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="lock me-3" size='lg'/>
                <MDBInput label='Password' id='form3' type='password'
                onChange={(e)=>setformData({...formData , passwordHash:e.target.value})}
                />
              </div>

              

              <div className='mb-4'>
                <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Subscribe to our newsletter' />
              </div>

              <MDBBtn className='mb-4' size='lg' onClick={handleLogin}>Login</MDBBtn>

            </MDBCol>

            <MDBCol md='10' lg='6' className='order-1 order-lg-2 d-flex align-items-center'>
            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" class="img-fluid" alt="Sample image" />
            </MDBCol>

          </MDBRow>
        </MDBCardBody>
      </MDBCard>

    </MDBContainer>
  );
}

export default Register;