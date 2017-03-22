CREATE TABLE EQUIPAMENTO (
cod int PRIMARY KEY,
descricao varchar(20),
tipoEq varchar(20),
login varchar(20)
);

CREATE TABLE USUARIO (
login varchar(20) PRIMARY KEY,
nome varchar(40),
email varchar(40),
senha varchar(100),
departamento varchar(20),
tipoUs char(1)
)

CREATE TABLE CHAMADO (
id int PRIMARY KEY,
dataAbertura datetime,
dataFim datetime,
descricao varchar(100),
printProblema longtext,
status int,
solucao longtext,
loginTecnico varchar(20),
loginSolicitante varchar(20),
FOREIGN KEY(loginTecnico) REFERENCES USUARIO (login),
FOREIGN KEY(loginSolicitante) REFERENCES USUARIO (login)
);

ALTER TABLE EQUIPAMENTO ADD FOREIGN KEY(login) REFERENCES USUARIO (login);

