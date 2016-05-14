function do_login(){
    var user = $('#email').val();
    var pass = $('#password').val();
    $('#login').prop('disabled', 'disabled');
    
    if (user > '' && pass > ''){
        $.post('/api/login', {user: user, pass: pass}, function(data){
            if (data == '1') {
                location.href = '/devices';
            } else {
                alert('Email ou senha incorreto');
                $('#login').removeAttr('disabled');
            }
        });
    } else alert('É necessário digitar email e senha');
}