/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var app = angular.module('helpApp', ['ngRoute', 'ngMessages', 'ngCookies', 'ngMask', 'naif.base64'])
        //Define o roteamento de acordo com a URL informada pelo usuario
        //Dependendo da URL irá verificar se o usuario está logado
        .config(['$routeProvider', function ($routeProvider) {
                //Definindo qual view será aberta em cada rota da aplicação
                $routeProvider
                        .when('/menu', {
                            templateUrl: 'views/menu.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/login', {
                            templateUrl: 'views/login.html'

                        })
                        .when('/equipamentos', {
                            templateUrl: 'views/equipamento.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/usuarios', {
                            templateUrl: 'views/usuario.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/chamados', {
                            templateUrl: 'views/chamado.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .otherwise({
                            redirectTo: '/login'
                        });
            }])
        //Verifica se o usuario está logado em cada mudança de rota (alteração da URL)
        .run(function ($rootScope, $location, $cookies) {
            $rootScope.$on('$routeChangeStart', function (ev, next, curr) {
                if (next.$$route) {
                    var user = $cookies.get('usuarioLogado');
                    var auth = next.$$route.auth;
                    if (auth && !auth(user)) {
                        $location.path('/');
                        console.info("Usuário não está logado!");
                    }
                }
            });
        });

app.controller('helpController',
        function ($scope, $http, $window, $rootScope, Configuracoes, $cookies) {
            /*
             * 
             * RESTFUL SERVICES
             * 
             **********************************************************/
            var urlBase = 'http://localhost/help/api';
            /*********************************************************
             *              
             */
            $scope.Configuracoes = Configuracoes;
            //Se estiver no cookie, carregamos o usuario logado
            $scope.Configuracoes.nomeUsuario = $cookies.get('nomeUsuarioLogado');
            //variaveis para a paginacao
            $scope.currentPage = 1;
            $scope.pageSize = 5;
            //direcionad para o menu inicial
            $scope.menu = function () {
                window.location = "#/menu";
            };
            /* Utilizado para exibir as informaçoes sobre a requisição ao Servidor */
            $scope.requisicaoServidor = {
                aguarde: false
            };

            //Função para imprimir uma determinada DIV da página HTML
            $scope.imprimeDiv = function (nomeDIV, nomeTitulo) {
                var printContents = document.getElementById(nomeDIV).innerHTML;
                var popupWin = window.open('', '_blank', 'width=1024,height=768');
                popupWin.document.open();
                popupWin.document.write('<html><head><title>Relatorio</title><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css"/></head>' +
                        '<body onload="window.print()"><img src="img/logo.jpg"><h1>HELP - Sistemas de chamados de T.I</h1><h2>' + nomeTitulo + '</h2>' + printContents + '</html>');
                popupWin.document.close();
            };
            /*
             * LOGIN
             * 
             */
            //funcao para validar o login
            $scope.validaLogin = function (login) {
                $http.get(urlBase + "/login/" + login.usuario + "/" + login.senha)
                        .success(function (data) {
                            if (data == 'true') {
                                $http.get(urlBase + "/usuarios/" + login.usuario).success(function(data){
                                    Configuracoes.tipoUs = data[0].tipoUs;
                                }).error(function(err){
                                    
                                });
                                
                                var urlInicial = "http://" + $window.location.host + "/help/#/menu";
                                    $window.location.href = urlInicial;
                                    $window.location;
                                    $rootScope.usuarioLogado = true;
                                    // Armazena o Cookie
                                    var nomeUsuario = login.usuario;
                                    var tipoUs = data.tipoUs;
                                    console.log(data.tipoUs);
                                    var dataExpiracao = new Date();
                                    
                                    //Definimos que o usuario poderá ficar logado no maximo 30 minutos
                                    dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);
                                    Configuracoes.nomeUsuario = nomeUsuario;
                                    Configuracoes.tipoUs = tipoUs;
                                    
                                    //Salvamos em um cookie
                                    $cookies.put('nomeUsuarioLogado', nomeUsuario, {'expires': dataExpiracao});
                                    $cookies.put('usuarioLogado', 'true', {'expires': dataExpiracao});
                                    console.log(Configuracoes);
                                                                       
                                
                            } else {
                                BootstrapDialog.alert({
                                    title: 'ATENÇÃO!',
                                    message: 'O usuário e/ou a senha informados são inválidos!',
                                    type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                    closable: true, // <-- Valor default é false          
                                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                                });
                                $scope.login = {};
                                $rootScope.usuarioLogado = false;
                                $scope.Configuracoes.nomeUsuario = "";
                            }
                            
                            
                        })
                        .error(function () {
                            console.log('Erro ao tentar validar a senha');
                            BootstrapDialog.alert({
                                title: 'ATENÇÃO!',
                                message: 'Não foi possível validar a senha no WebService. Verifique se o endereço e/ou a porta informada estão corretos!',
                                type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false          
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                            });
                        });
            };
            //funcao para efetuar o logout
            $scope.logout = function () {
                $cookies.remove('nomeUsuarioLogado');
                $cookies.remove('usuarioLogado');
                Configuracoes.nomeUsuario = '';
                localStorage.setItem('user',{});
            };
            //funcao para verificar se a senha e a confirmacao sao iguais
            $scope.validaSenha = function () {
                alert($scope.formUsuario.senha.toString());
                alert($scope.formUsuario.confirmacao.toString());
                $scope.formUsuario.confirmacao.$invalid = (1 === 1) ? false : true;
            };
            /*========================================================
             * EQUIPAMENTO
             ========================================================*/
            $scope.equipamento = {};
            //Limpa o status touched dos campos do formulario
            $scope.limpaEquipamento = function (nomeForm) {
                nomeForm.descricao.$touched = false;
                nomeForm.tipo.$touched = false;
            };

            $scope.limpaArrayEquipamento = function () {
                $scope.equipamento = {};
            };

            $scope.carregaEquipamentos = function () {
                getEquipamentos();
            };

            $scope.obtemEquipamentoPeloId = function (equipamento) {
                $http.get(urlBase + "/equipamentos/" + equipamento.cod)
                        .success(function (data) {
                            $scope.equipamento = data[0];
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do equipamento');
                            $scope.equipamento = "ERRO ao efetuar o SELECT!";
                        });
            };
            // Exibe caixa de diálogo para a exclusão
            $scope.confirmaExclusaoEquipamento = function (equipamento) {
                $scope.requisicaoServidor = {aguarde: true};
                var dialog = new BootstrapDialog.show({
                    title: 'Confirmação da Exclusão',
                    message: 'Atenção! Confirma a exclusão do equipamento <strong>' + equipamento.descricao + '</strong>?<br> Esta operação não poderá ser desfeita!',
                    buttons: [{
                            icon: 'glyphicon glyphicon-ban-circle',
                            label: '(N)ão',
                            cssClass: 'btn-info',
                            hotkey: 78, // Código da tecla para o N (ASCII=78)
                            action: function () {
                                dialog.close();
                            }
                        }, {
                            icon: 'glyphicon glyphicon-ok-circle',
                            label: '(S)im',
                            cssClass: 'btn-danger',
                            hotkey: 83, // Código da tecla para o S (ASCII=83)
                            action: function () {
                                apagaEquipamento(equipamento.cod);
                                dialog.close();
                            }
                        }
                    ]
                });
                $scope.requisicaoServidor = {aguarde: false};
            };

            $scope.salvaEquipamento = function (equipamento) {
                $scope.requisicaoServidor = {aguarde: true};
                if (equipamento.cod == undefined) {
                    equipamento.cod = 0;
                }

                $http.post(urlBase + "/equipamentos", equipamento).success(function (data) {
                    console.info(JSON.stringify("Grupo salvo com sucesso!: " + data));
                    getEquipamentos();
                }).error(function (error) {
                    console.error(JSON.stringify("Erro ao incluir o equipamento: " + error));
                    BootstrapDialog.alert({
                        title: 'ATENÇÃO!',
                        message: 'Erro ao salvar o equipamento:' + error,
                        type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                        closable: true, // <-- Valor default é false          
                        buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                    });
                });
                $scope.equipamento = {};
                BootstrapDialog.alert({
                    title: 'Processo efetuado com sucesso!',
                    message: 'O registro foi armazenado com sucesso no banco de dados.',
                    type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                    closable: true, // <-- Valor default é false
                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            
            $scope.editarEquipamento = function (equip){
              $scope.equipamento.cod = equip.cod;
              $scope.equipamento.descricao = equip.descricao;
              $scope.equipamento.tipoEq = equip.tipoEq;
              $scope.equipamento.login = equip.login;
            };

            function getEquipamentos() {
                $http.get(urlBase + "/equipamentos")
                        .success(function (data) {
                            $scope.equipamentos = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do grupo');
                            $scope.equipamentos = "ERRO ao efetuar o SELECT!";
                        });
            }
            ;


            function apagaEquipamento(codigo) {
                $http.delete(urlBase + "/equipamentos/" + codigo).success(function (data) {
                    if (data != 1) {
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'Erro ao APAGAR o equipamento:' + data,
                            type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });

                    } else {
                        console.info("Equipamento de ID " + codigo + " removido com sucesso!");
                        BootstrapDialog.alert({
                            title: 'Exclusão efetuada com sucesso!',
                            message: 'O registro foi excluído com sucesso do banco de dados.',
                            type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                        });
                    }
                    ;
                    getEquipamentos();
                });
            }
            ;
            
            

            /*========================================================
             * FIM das Funções relacionados aos EQUIPAMENTOS
             ========================================================*/

            /*========================================================
             * CHAMADO
             ========================================================*/
            $scope.chamado = {};
            //Limpa o status touched dos campos do formulario
            $scope.limpaChamado = function (nomeForm) {
                nomeForm.descricao.$touched = false;
                nomeForm.status.$touched = false;
                nomeForm.solucao.$touched = false;
            };
            //limpa o array do Produto (utilizado quando o usuario cancela a inclusao ou edicao)
            $scope.limpaArrayChamado = function () {
                $scope.chamado = {};
            };

            $scope.limpaPrintProblema = function (print) {
                print = {
                    base64: '',
                    filename: '',
                    filesize: '',
                    filetype: ''
                };
                //limpar o arquivo selecionado no input type="file"
                var control = $("#printproblema");
                control.replaceWith(control = control.clone(true));

            };

            $scope.carregaChamados = function () {
                getChamados();
            };

            $scope.obtemChamadoPeloId = function (chamado) {
                $http.get(urlBase + "/chamado/" + chamado.id)
                        .success(function (data) {
                            $scope.chamado = data[0];
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do chamado');
                            $scope.produto = "ERRO ao efetuar o SELECT!";
                        });
            };

            $scope.confirmaExclusaoChamado = function (chamado) {
                $scope.requisicaoServidor = {aguarde: true};
                var dialog = new BootstrapDialog.show({
                    title: 'Confirmação da Exclusão',
                    message: 'Atenção! Confirma a exclusão do chamado Nrº ' + chamado.id + '? Esta operação não poderá ser desfeita!',
                    buttons: [{
                            icon: 'glyphicon glyphicon-ban-circle',
                            label: '(N)ão',
                            cssClass: 'btn-info',
                            hotkey: 78, // Código da tecla para o N (ASCII=78)
                            action: function () {
                                dialog.close();
                            }
                        }, {
                            icon: 'glyphicon glyphicon-ok-circle',
                            label: '(S)im',
                            cssClass: 'btn-danger',
                            hotkey: 83, // Código da tecla para o S (ASCII=83)
                            action: function () {
                                apagaChamado(chamado.id);
                                dialog.close();
                            }
                        }
                    ]
                });
                $scope.requisicaoServidor = {aguarde: false};
            };

            $scope.salvaChamado = function (chamado) {
                $scope.requisicaoServidor = {aguarde: true};
                if (chamado.id == undefined) {
                    chamado.id = 0; 
                }
                
                if(Configuracoes.tipoUs == 'U')
                    chamado.loginSolicitante = Configuracoes.nomeUsuario;
                
                $http.post(urlBase + "/chamados", chamado).success(function (data) {
                    console.info(JSON.stringify("Produto salvo com sucesso!: " + data));
                    getChamados();
                }).error(function (error) {
                    console.error(JSON.stringify("Erro ao incluir o chamado: " + error));
                    BootstrapDialog.alert({
                        title: 'ATENÇÃO!',
                        message: 'Erro ao salvar o chamado:' + error,
                        type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                        closable: true, // <-- Valor default é false          
                        buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                    });
                });
                $scope.chamado = {};
                BootstrapDialog.alert({
                    title: 'Processo efetuado com sucesso!',
                    message: 'O registro foi armazenado com sucesso no banco de dados.',
                    type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                    closable: true, // <-- Valor default é false
                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                });
                $scope.requisicaoServidor = {aguarde: false};

            };

            function getChamados() {
                $http.get(urlBase + "/chamados")
                        .success(function (data) {
                            $scope.chamados = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados dos chamados');
                            $scope.produtos = "ERRO ao efetuar o SELECT!";
                        });
            }
            
            function apagaChamado(codigo) {
                //providenciamos a exclusão.
                $http.delete(urlBase + "/chamados/" + codigo).success(function (data) {
                    if (data !== true) {
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'Erro ao APAGAR o chamado:' + data,
                            type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });

                    } else {
                        console.info("Chamado ID " + codigo + " removido com sucesso!");
                        BootstrapDialog.alert({
                            title: 'Exclusão efetuada com sucesso!',
                            message: 'O registro foi excluído com sucesso do banco de dados.',
                            type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                        });
                    }
                    ;
                    getChamados();
                });
            }
            ;
            
            $scope.editarChamado = function (chamado){
                $scope.chamado.id = chamado.id;
                $scope.chamado.descricao = chamado.descricao;
                $scope.chamado.status = chamado.status;
                $scope.chamado.solucao = chamado.solucao;
                $scope.chamado.loginSolicitante = chamado.loginSolicitante;
                $scope.chamado.loginTecnico = chamado.loginTecnico;
            };

            /*========================================================
             * FIM das Funções relacionados aos PRODUTOS
             ========================================================*/

            /*========================================================
             * USUARIOS
             ========================================================*/
            $scope.usuario = {};
            
            //Limpa o status touched dos campos do formulario
            $scope.limpaUsuario = function (nomeForm) {
                nomeForm.login.$touched = false;
                nomeForm.nome.$touched = false;
                nomeForm.senha.$touched = false;
                nomeForm.email.$touched = false;
                nomeForm.departamento.$touched = false;
                nomeForm.tipoUs.$touched = false;
                nomeForm.confirmacao = '';

            };
            //limpa o array do Usuario (utilizado quando o usuario cancela a inclusao ou edicao)
            $scope.limpaArrayUsuario = function () {
                $scope.usuario = {};
            };
            // Carregando os usuarios no array
            $scope.carregaUsuarios = function () {
                getUsuarios(); // Carrega todos os usuarios   

            };

            function getUsuarios() {
                $http.get(urlBase + "/usuarios")
                        .success(function (data) {
                            $scope.usuarios = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do usuario');
                            $scope.usuarios = "ERRO ao efetuar o SELECT!";
                        });
            }
            
            $scope.salvaUsuario = function (usuario) {
                $scope.requisicaoServidor = {aguarde: true};
                
                $http.post(urlBase + "/usuarios", usuario).success(function (data) {
                    console.info(JSON.stringify("Usuário salvo com sucesso!: " + data));
                    getUsuarios();
                }).error(function (error) {
                    console.error(JSON.stringify("Erro ao incluir o usuário: " + error));
                    BootstrapDialog.alert({
                        title: 'ATENÇÃO!',
                        message: 'Erro ao salvar o usuário:' + error,
                        type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                        closable: true, // <-- Valor default é false          
                        buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                    });
                });
                $scope.usuario = {};
                BootstrapDialog.alert({
                    title: 'Processo efetuado com sucesso!',
                    message: 'O registro foi armazenado com sucesso no banco de dados.',
                    type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                    closable: true, // <-- Valor default é false
                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            
            $scope.editarUsuario = function(usuario){
                $scope.usuario.login = usuario.login;
                $scope.usuario.nome = usuario.nome;
                $scope.usuario.email = usuario.email;
                $scope.usuario.senha = usuario.senha;
                $scope.usuario.departamento = usuario.departamento;
                $scope.usuario.tipoUs = usuario.tipoUs;
            }

            /*========================================================
             * FIM das Funções relacionados aos USUARIOS
             ========================================================*/



        });

app.factory('Configuracoes', function () {
    return {nomeUsuario: ''};
});

/*
 * DIRETIVAS (POSSIBILITA CRIAR NOVAS TAGS NO HTML)
 */
// diretiva verificaSenha. No HTML chamamos como verifica-senha
app.directive('verificaSenha', [function () {
        return {
            scope: {comparasenha: '='},
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var primeiraSenha = '#' + attrs.verificaSenha;
                elem.add(primeiraSenha).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val() === $(primeiraSenha).val();
                        ctrl.$setValidity("comparasenha", v);
                    });
                });
            }
        };
    }]);


//utilizado para converter um valor string em numerico
app.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
});


