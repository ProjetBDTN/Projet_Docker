<?php

session_start();


	include 'connectMySql.inc.php';
    $mail='';
	if (isset($_POST['mail'])) {
		$mail = $_POST['mail'];
	}

	$password='';
	if (isset($_POST['password'])) {
		$password = $_POST['password'];
		$password_hache = sha1($password);
	}



    $reponse = connectMySql()->query('SELECT * FROM user WHERE user_email = \''.$mail.'\'');
    while ($donnees = $reponse->fetch())
    {
        if($donnees==0)
        {
            echo "Emailinvalide";
            ?>
<button class="btn btn-primary" onclick="{location.href='connection.php'}">Retourner</button>
<?php

        }
        elseif ($password_hache==$donnees['user_password'])
        {
            $_SESSION['id']=$donnees['user_id'];
            $_SESSION['nom']=$donnees['user_nom'];
            $_SESSION['prenom']=$donnees['user_prenom'];
			#echo "Hello";
            header("Location: index2.php");
            exit();
        }
        else
        {
            echo "Mot de passe invalide";
            ?>
<button class="btn btn-primary" onclick="{location.href='index.php'}">Retourner</button>
<?php

        }

    }
    $reponse->closeCursor();


?>
