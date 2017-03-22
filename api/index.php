<?php

/*
 * PROJETO REST EM PHP
 * Para funcionar é necessário habilitar o mod_rewrite no Apache
 * sudo a2enmod rewrite
 * sudo service apache2 restart
 * Editar o arquivo de configuração e inserir
 * sudo nano /etc/apache2/apache2.conf
 * <Directory "/var/www/html">
  Options FollowSymlinks
  AllowOverride All
  Order allow,deny
  Allow from all
  </Directory>
 *  */

//definido as variáveis para conexão ao SGBD
$db_host = 'localhost';
$db_name = 'help';
$db_user = 'root';
$db_password = 'math2569';

// Carregando a lib Fat Free do PHP
$f3 = require('lib/base.php');
//Atribuimos que estamos em modo desenvolvimento. O modo produção é 0
$f3->set('DEBUG', 1);
//Conectando ao MySQL
$f3->set('DB', $db = new DB\SQL(
        "mysql:host=$db_host;port=3306;dbname=$db_name", $db_user, $db_password, array(\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION)));


$f3->route('GET /', 'inicio');

function inicio() {
    echo 'API - HELP SISTEMA DE CHAMADOS';
}

//ROTAS RELACIONADAS A USUARIOS
$f3->route('GET /login/@usuario/@senha', 'getLogin');
$f3->route('GET /usuarios','getUsuarios');
$f3->route('GET /usuarios/@id','getUsuario');
$f3->route('POST /usuarios','salvarUsuario');
$f3->route('DELETE /usuarios/@id','apagarUsuario');
$f3->route('GET /usuarios/checalogin/@login', 'verificaLoginExistente');

//ROTAS RELACIONADAS A EQUIPAMENTO
$f3->route('GET /equipamentos','getEquipamentos');
$f3->route('GET /equipamentos/@id','getEquipamento');
$f3->route('POST /equipamentos','salvaEquipamento');
$f3->route('DELETE /equipamentos/@id','apagarEquipamento');

//ROTAS RELACIONADAS A CHAMADO
$f3->route('GET /chamados','getChamados');
$f3->route('GET /chamados/usuario/@login','getChamadoUsuario');
$f3->route('GET /chamados/tecnico/@login','getChamadoTecnico');
$f3->route('POST /chamados','salvarChamado');
$f3->route('DELETE /chamados/@id','apagarChamado');

$f3->run();

/*=============================================================
 * INICIO - FUNÇÕES RELACIONADAS A USUÁRIO
 *=============================================================
*/

function getLogin($f3){
    $loginValido = false;
    $usuario = $f3->get('PARAMS.usuario');
    $senha = $f3->get('PARAMS.senha');
    $sql = "select * FROM USUARIO where login=? AND md5(?)=senha";    
    //iremos contar o número de registros retornados no count...
    $f3->set('dados', count($f3->get('DB')->exec($sql, array(1 => $usuario, 2 => $senha))));
    //Se o número for igual a 1, o usuario e a senha são válidos!
    if ($f3->get('dados') == 1) {
        $loginValido = true;
    }
    echo json_encode($loginValido);
}

function getUsuario($f3){
    $login = $f3->get('PARAMS.id');
    $sql = "SELECT login,nome,email,departamento,tipoUs FROM USUARIO WHERE login = ?";
    
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql, array(1 => $login)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function getUsuarios($f3){
    $sql = "SELECT login,nome,email,departamento,tipoUs FROM USUARIO";
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function salvarUsuario($f3) {
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json);
    $achou = false;
    
    $sql = "SELECT login FROM USUARIO WHERE login = ?";
    
    try{
        $f3->get('DB')->exec($sql, array(1 => $obj->login));
        if($f3->get('DB')->count() > 0){
            $achou = true;
        }
        else{
            $achou = false;
        }
            
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
    
    $sql_insert = "insert into USUARIO (login, nome, email, senha, departamento, tipoUs) values (?,?,?,md5(?),?,?)";
    $sql_update = "update USUARIO set login =?, nome=?, email=?, senha= md5(?), departamento=?, tipoUs= (?) where login = ?";
    try {
        if ($achou) {
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->login,  2 => $obj->nome, 3 => $obj->email, 4 => $obj->senha, 5 => $obj->departamento, 6=> $obj->tipoUs, 7=> $obj->login)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->login,  2 => $obj->nome, 3 => $obj->email, 4 => $obj->senha, 5 => $obj->departamento, 6=> $obj->tipoUs)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function apagarUsuario($f3){
    $login = $f3->get('PARAMS.id');
    $sql = "DELETE FROM USUARIO WHERE login = ?";
    
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql, array(1 => $login)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}


/*=============================================================
 * FIM - FUNÇÕES RELACIONADAS A USUÁRIO
 *=============================================================
*/

/*=============================================================
 * INICIO - FUNÇÕES RELACIONADAS A EQUIPAMENTO
 *=============================================================
*/

function getEquipamentos($f3){
    $sql = "SELECT cod,descricao,tipoEq,login FROM EQUIPAMENTO";
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function getEquipamento($f3){
    $cod = $f3->get('PARAMS.id');
    $sql = "SELECT cod,descricao,tipoEq,login FROM EQUIPAMENTO WHERE cod = ?";
    
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql, array(1 => $cod)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function salvaEquipamento($f3) {
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json);
    
    $sql_insert = "insert into EQUIPAMENTO (descricao,tipoEq,login) values (?,?,?)";
    $sql_update = "update EQUIPAMENTO set  cod=?, descricao=?, tipoEq = (?), login =?  where cod = ?";
    try {
        if ($obj->cod != 0) {
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->cod,  2 => $obj->descricao, 3 => $obj->tipoEq, 4 => $obj->login->login, 5=> $obj->cod)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->descricao, 2 => $obj->tipoEq, 3 => $obj->login->login)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function apagarEquipamento($f3){
    $cod = $f3->get('PARAMS.id');
    $sql = "DELETE FROM EQUIPAMENTO WHERE cod = ?";
    
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql, array(1 => $cod)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}


/*=============================================================
 * FIM - FUNÇÕES RELACIONADAS A EQUIPAMENTO
 *=============================================================
*/

/*=============================================================
 * INICIO - FUNÇÕES RELACIONADAS A CHAMADO
 *=============================================================
*/

function getChamados($f3){
    $sql = "SELECT * FROM CHAMADO";
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function getChamadoUsuario($f3){
    $id = $f3->get('PARAMS.login');
    $sql = "SELECT * FROM CHAMADO WHERE loginSolicitante = ?";
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql,array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function getChamadoTecnico($f3){
    $id = $f3->get('PARAMS.login');
    $sql = "SELECT * FROM CHAMADO WHERE loginTecnico = ?";
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql,array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}

function salvarChamado($f3) {
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json);
    
    $sql_insert = "insert into CHAMADO (dataAbertura,descricao,loginSolicitante,loginTecnico, status) values (now(),?,?,?,?)";
    $sql_update = "update CHAMADO set dataFim=now(), descricao=?, status =?, solucao=?, loginTecnico=?, loginSolicitante=?  where id = ?";
    try {
        if ($obj->id != 0) {
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->descricao, 2 =>  $obj->status, 3 => $obj-> solucao, 4 => $obj-> loginTecnico->login, 5 => $obj->loginSolicitante, 6 => $obj-> id)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->descricao, 2 => $obj->loginSolicitante, 3 => $obj->loginTecnico->login, 4 => $obj->status)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function apagarChamado($f3){
    $cod = $f3->get('PARAMS.id');
    $sql = "DELETE FROM CHAMADO WHERE id = ?";
    
    try{
        $f3->set('dados',$f3->get('DB')->exec($sql, array(1 => $cod)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $ex) {
        http_response_code(500);
        die($ex->getMessage());
    }
}