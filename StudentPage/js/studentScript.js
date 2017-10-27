function setActive() {
    //(this.className=='week_button')?this.className='active_button':this.className='week_button';
    var button = document.querySelectorAll('.button');
    //alert( button[1].value );
    //alert(button[3].nodeValue);
    for(var i = 0; i < button.length; i++){
        button[i].addEventListener('click', function(){
            this.classList.toggle('active_button');
            //alert(this.nodeValue);
            //alert('k');
        });
    }
}
setActive();
