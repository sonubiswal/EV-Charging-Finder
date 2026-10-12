const signupbutton=document.getElementById('signupbutton');
const signinbutton=document.getElementById('signinbutton');
const signinfrom=document.getElementById('SignIn');
const signupfrom=document.getElementById('SignUp');

signupbutton.addEventListener('click', function(){
    signinfrom.style.display="none";
    signupfrom.style.display="block";
})
signinbutton.addEventListener('click', function(){
    signinfrom.style.display="block";
    signupfrom.style.display="none";
})
