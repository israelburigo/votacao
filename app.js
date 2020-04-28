//var URL_API = 'http://localhost:59606/api/Votacao/';
var URL_API = 'http://e2desenv86.useall.corp/apivotacao/api/votacao/';
var URL_FRONT = 'http://e2desenv86.useall.corp/votacao/';

var app = {
    dataHoraFimVotacao: undefined,
    dataHoraInicioVotacao: undefined,
    ultimaPergunta: undefined,
    id: undefined,
    votacaoEmAndamento: true,
	
	onClickTantoFaz: function() {
        this.requestVotar(0);
    },

    onClickSim: function() {
        this.requestVotar(1);
    },

    onClickNao: function() {
        this.requestVotar(2);
    },

    onClickJustificar: function() {
        var me = this,
            dto = {
                Id: localStorage.getItem('GUID_SECRETO'),
                Justificativa: document.getElementById('justificativaTexto').value                
            };

        $.ajax({
           type: "POST",
           url: URL_API + 'Justificar',
           data: dto,
           success: function(msg){
                me.recuperarVotos();
                document.getElementById('justificativaTexto').value = "";    
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });


    },

    onClickConfirmarNome: function() {
        localStorage.setItem('nomeVotacao', document.getElementById('nomeGamelao').value);

        var me = this,
        dto = {
            Id: localStorage.getItem('GUID_SECRETO'),
            Nome: document.getElementById('nomeGamelao').value                
        };

        $.ajax({
           type: "POST",
           url: URL_API + 'MudarNomezinho',
           data: dto,
           success: function(msg){
                me.recuperarVotos();
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });
    },

    onClickCadastrar: function() {
        //localStorage.setItem('nomeVotacao', document.getElementById('nomeGamelao').value);

        var me = this,
        dto = {
            Nome: document.getElementById('nomeGamelao').value,
            Nomezinho: document.getElementById('apelidoGamelao').value
        };

        $.ajax({
           type: "POST",
           url: URL_API + 'Cadastrar',
           data: dto,
           success: function(ret){
                localStorage.setItem('GUID_SECRETO', ret.Content.Id);
                localStorage.setItem('nomeVotacao', dto.Nomezinho);
                location.href = URL_FRONT;                
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });
    },

    onClickLoginho: function() {
        //localStorage.setItem('nomeVotacao', document.getElementById('nomeGamelao').value);

        var me = this,
        dto = {
            Nome: document.getElementById('nomeGamelao').value,
            Senha: document.getElementById('senhaGamelao').value
        };

        $.ajax({
           type: "POST",
           url: URL_API + 'Loguinho',
           data: dto,
           success: function(ret){
                localStorage.setItem('GUID_SECRETO', ret.Content.Id);
                localStorage.setItem('nomeVotacao', ret.Content.Nomezinho);
                location.href = URL_FRONT;                
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });
    },

    recuperarNome: function() {
		if(location.href == URL_FRONT+'cadastrinho.html')
            return;
		
        var nome = localStorage.getItem('nomeVotacao');
        if(nome && nome != 'undefined')
            document.getElementById('nomeGamelao').value = nome;
    },

    onClickAtualizar: function() {
        this.recuperarVotos();
    },

    recuperarVotos: function(cb) {
        var me = this,
            table = document.getElementById("tabelaVotos");        

        // Add some text to the new cells:

        if (!app.verificaLogado())
            return;

        var guid = localStorage.getItem('GUID_SECRETO');
	
		$.get(URL_API + 'ConsultaVotos?id='+guid, function(data){
			       var votos = data.Content.Votos;

             app.votacaoEmAndamento = data.Content.VotacaoEmAndamento;

            if(data.Content.Id !== me.id){
                new window.Notification('Nova pergunta', {body: data.Content.NomeDoSujeitoQueIniciouSessao + " pergunta: " + data.Content.Pergunta});
                var total = table.rows.length;
                for (var i = 1; i <= total - 1; i++) {
                    table.deleteRow(1);
                }
            }

			for (var i = 0; i <= votos.length - 1; i++) {
          var row, cell1, cell2, cell3;

          row = document.getElementById(votos[i].Guid);

          if(!row){
              row = table.insertRow(table.rows.length);
              cell1 = row.insertCell(0);
              cell2 = row.insertCell(1);    
              cell3 = row.insertCell(2);  
          } else {
              cell1 = row.cells[0];
              cell2 = row.cells[1];
              cell3 = row.cells[2];

          }   

          if(row.id != votos[i].Guid)
  				  row.id = votos[i].Guid;

          if (cell1.innerHTML != votos[i].Usuario.Nomezinho)
  				  cell1.innerHTML = votos[i].Usuario.Nomezinho;

          if(cell3.guidJust != votos[i].Justificativa.Guid)
		  {
            cell3.innerHTML = votos[i].Justificativa.Texto;
			cell3.guidJust = votos[i].Justificativa.Guid;
			}

  				if(votos[i].Voto === 1)					
  					cell2.innerHTML = 'Sim';
  				else if(votos[i].Voto === 2)					
  					cell2.innerHTML = 'Não';
  				else if(votos[i].Voto === 0)					
  					cell2.innerHTML = 'Tanto faz';
  			} 

            document.getElementById('totalSim').innerText = data.Content.VotosSim;
            document.getElementById('totalNao').innerText = data.Content.VotosNao;
            document.getElementById('totalTantoFaz').innerText = data.Content.VotosTantoFaz;
            document.getElementById('tempoRestante').innerText = data.Content.TempoVotacao;

            me.dataHoraInicioVotacao = new Date(data.Content.InicioVotacao);

            me.ultimaPergunta = data.Content.Pergunta;
            me.id = data.Content.Id;

            document.getElementById("pergunta").innerHTML = data.Content.NomeDoSujeitoQueIniciouSessao + " pergunta: " + data.Content.Pergunta;

		});        

        if(cb)
            cb();
    },   

    requestVotar: function(opc) {
        var me = this,
            dto = {
                Id: localStorage.getItem('GUID_SECRETO'),
                Voto: opc,
                Justificativa: document.getElementById('justificativaTexto').value
            };

        $.ajax({
           type: "POST",
           url: URL_API + 'Votar',
           data: dto,
           success: function(msg){
             me.recuperarVotos();
             document.getElementById('justificativaTexto').value = "";    
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });
    },

    onClickNovaVotacao: function() {
        var me = this,
            dto = {
                Id: localStorage.getItem('GUID_SECRETO'),
                Pergunta: document.getElementById('descricaoPergunta').value
            };

        $.ajax({
           type: "POST",
           url: URL_API + 'IniciarVotacao',
           data: dto,
           success: function(msg){
                me.recuperarVotos();
                document.getElementById('descricaoPergunta').value = "";
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
             alert(XMLHttpRequest.responseJSON.Message);
           }
        });
    },

    atualizarAutomaticamente: function() {
        var me = this;

        setTimeout(function(){
            me.recuperarVotos(function(){
                me.atualizarAutomaticamente();
            });
        }, 1000);
    },

    timer: function() {

    },

    verificaLogado: function(){
        if(location.href == URL_FRONT+'cadastrinho.html')
            return;

        if(location.href == URL_FRONT+'loginho.html')
            return;

        var guid = localStorage.getItem('GUID_SECRETO');

        if(!guid){
            location.href = URL_FRONT+'loginho.html';
            return;
        }

        return true;
    },

    onClickCairFora: function() {
        localStorage.setItem('GUID_SECRETO', '');
        location.href = URL_FRONT+'loginho.html';
        localStorage.setItem('nomeVotacao', '');
    },

    onClickVerSenha: function() {
      var guid = localStorage.getItem('GUID_SECRETO');

        $.get(URL_API + 'PegarSenha?id='+guid, function(data){
          alert("Sua senha é : " + data.Content);
        });
    }
};

app.verificaLogado();

app.recuperarNome();

app.recuperarVotos();

app.atualizarAutomaticamente();