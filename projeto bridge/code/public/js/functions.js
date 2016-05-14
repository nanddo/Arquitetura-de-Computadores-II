function showDialogInput(title, placeholder, def_val, func_confirm) {
    $('#modal-input h4').html(title);
    $('#modal-input input').prop('placeholder', placeholder).val(def_val);
    $('#modal-input #confirmar').unbind();
    $('#modal-input #confirmar').bind('click', function() {
        func_confirm();
        return false;
    });
    $('#modal-input input').keypress(function(e) {
        if (e.which == 13) {
            $('#modal-input #confirmar').click();
        }
    });
    $('#modal-input').openModal();
}

function showDialog(content){
	if (!$('#modal-erro').is(':visible')){
		$('#modal-erro p').html(content);
		$('#modal-erro').openModal();
	}
}

function rename(el, id) {
    showDialogInput('Renomear ponte', '', $(el).text(), function() {
        var new_name = $('#modal-input input').val();
        $.ajax({
            method: 'post',
            url: '/api/renameDevice',
            data: {
                id: id,
                name: new_name
            }
        });
        $(el).text(new_name);
    });
}

function save_limits(id) {
	var ax = $('#ax').val(), ay = $('#ay').val(), az = $('#az').val(), t = $('#t').val(), p = $('#p').val();
	$.ajax({
		url: '/api/setLimits',
		method: 'post',
		data: {
			id: id,
			ax: ax,
			ay: ay,
			az: az,
			t: t,
			p: p
		}
	});
	$('.limites:first').text('Acel X: ' + ax + ', Acel Y: ' + ay + ', Acel Z: ' + az + ', Temp: ' + t + ', Piezo: ' + p);
}

function add_device(user_id, device_id){
	if (!$('#modal-erro').is(':visible')){
		$('#add').prop('disabled', 'disabled');
		$.ajax({
			url: '/api/add_device',
			method: 'post',
			data: {
				user_id: user_id,
				device_id: device_id
			}
		}).done(function(data) {
			alert( data );
		})
		.fail(function() {
			Materialize.toast( "Falha na conexão, tente novamente!", 3000 );
		})
		.always(function() {
			$('#add').removeAttr('disabled');
		});
	}
}

$(function() {
    $('[href="#"],[href="#!"]').unbind().bind('click', function() {
        return false;
    });
});