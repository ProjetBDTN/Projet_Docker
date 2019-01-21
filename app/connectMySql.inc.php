<?php
function connectMySQL() {
    $host='localhost:3306';
    $bdd='wwc';
    $user='wwc'; // 'root' pendant le développement, selon votre projet pour le serveur de l'école:w
    $pass='123'; // 'root' pour MAMP, '' pour EasyPHP, selon votre projet pour le serveur de l'école

    try {
        $dbh = new PDO('mysql:host='.$host.';dbname='.$bdd.';charset=utf8', $user,$pass);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbh;
    } catch (PDOException $e) {
        print "Erreur !: " . $e->getMessage() . "<br/>";
        die();
    }
}
?>
