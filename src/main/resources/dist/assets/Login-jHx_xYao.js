import{r as l,u as j,j as e,L as u}from"./index-C9TKiR0q.js";import{T as g,a as o,i as N}from"./logo-2cFvjBA9.js";import"./CloseButton-Dk6N_CPr.js";function y(){const[n,d]=l.useState(""),[c,m]=l.useState(""),[t,i]=l.useState([]),h=j(),x=async s=>{s.preventDefault();const a=s.currentTarget;if(!a.checkValidity()){s.stopPropagation(),a.classList.add("was-validated");return}if(!n||!c){i([...t,new Error("Email and password are required")]);return}const r=await fetch("http://localhost:8080/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:c}),credentials:"include"});if(r.ok){const{data:p}=await r.json();localStorage.setItem("data",JSON.stringify(p)),h("/")}else i([...t,new Error("Invalid email or password")])};return e.jsxs("section",{children:[e.jsx(g,{position:"top-end",className:"p-3",children:t.map((s,a)=>e.jsxs(o,{onClose:()=>{const r=[...t];r.splice(a,1),i(r)},delay:3e3,autohide:!0,children:[e.jsx(o.Header,{children:e.jsx("strong",{className:"me-auto",children:"Error"})}),e.jsx(o.Body,{children:s.message})]},a))}),e.jsx("div",{className:"container mt-5",children:e.jsx("div",{className:"row justify-content-center",children:e.jsx("div",{className:"col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4",children:e.jsx("div",{className:"card border border-light-subtle rounded-3 shadow-sm",children:e.jsxs("div",{className:"card-body p-3 p-md-4 p-xl-5",children:[e.jsx("div",{className:"text-center mb-3",children:e.jsx("img",{src:N,alt:"Fidelitas logo",width:"90",height:"90"})}),e.jsx("h2",{className:"fs-6 fw-normal text-center text-secondary mb-4",children:"Sign in to your account"}),e.jsx("form",{method:"post",className:"needs-validation",onSubmit:s=>x(s),noValidate:!0,children:e.jsxs("div",{className:"row gy-2",children:[e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"form-floating mb-3",children:[e.jsx("input",{type:"email",className:"form-control",id:"email",onChange:s=>d(s.target.value),required:!0}),e.jsx("label",{htmlFor:"email",children:"Email address"}),e.jsx("div",{className:"invalid-feedback",children:"Please enter a valid email address."})]})}),e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"form-floating mb-3",children:[e.jsx("input",{type:"password",className:"form-control",name:"password",id:"password",onChange:s=>m(s.target.value),required:!0}),e.jsx("label",{htmlFor:"password",children:"Password"}),e.jsx("div",{className:"invalid-feedback",children:"Please enter your password."})]})}),e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"d-flex gap-2 justify-content-between",children:[e.jsxs("div",{className:"form-check",children:[e.jsx("input",{className:"form-check-input",type:"checkbox",value:"",name:"rememberMe",id:"rememberMe"}),e.jsx("label",{className:"form-check-label text-secondary",htmlFor:"rememberMe",children:"Keep me logged in"})]}),e.jsx("a",{href:"/forgot-password",className:"link-primary text-decoration-none",children:"Forgot password?"})]})}),e.jsx("div",{className:"col-12",children:e.jsx("div",{className:"d-grid my-3",children:e.jsx("button",{className:"btn btn-primary btn-lg",type:"submit",children:"Log in"})})}),e.jsx("div",{className:"col-12",children:e.jsxs("p",{className:"m-0 text-secondary text-center",children:["Don't have an account?"," ",e.jsx(u,{className:"link-primary text-decoration-none",to:"/register",children:"Sign up"})]})})]})})]})})})})})]})}export{y as default};