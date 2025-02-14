var peer;
var myStream = null; // Initialisation à null pour éviter l'affichage avant l'enregistrement

// Fonction pour ajouter une vidéo sans duplication
function ajoutVideo(stream, userId) {
    let existingVideo = document.getElementById(`video-${userId}`);

    // Vérifier si la vidéo existe déjà pour cet utilisateur
    if (!existingVideo) {
        let video = document.createElement('video');
        video.id = `video-${userId}`;
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
    }
}

// Fonction pour enregistrer l'utilisateur et initialiser le peer
function register() {
    var name = document.getElementById('name').value.trim();

    if (!name) {
        alert("Veuillez entrer un nom !");
        return;
    }

    try {
        peer = new Peer(name);  // Créer un peer avec le nom de l'utilisateur

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                myStream = stream; // Stocke le flux local
                ajoutVideo(stream, "self"); // Ajoute la vidéo uniquement après l'enregistrement du nom
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                // Réception d'un appel entrant
                peer.on('call', function(call) {
                    call.answer(myStream); // Répondre avec le flux local
                    call.on('stream', function(remoteStream) {
                        ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo de l'appelant si elle n'existe pas déjà
                    });
                });
            })
            .catch(function(err) {
                console.log('Échec de l\'accès au flux vidéo/audio', err);
            });

    } catch (error) {
        console.error("Erreur lors de la création du peer:", error);
    }
}

// Fonction pour appeler un utilisateur
function appelUser() {
    var name = document.getElementById('add').value.trim();
    
    if (!name || !myStream) {
        alert("Veuillez entrer un nom valide et vous enregistrer d'abord !");
        return;
    }

    var call = peer.call(name, myStream);
    
    call.on('stream', function(remoteStream) {
        ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'utilisateur appelé
    });

    document.getElementById('add').value = ""; // Réinitialiser l'entrée
}

// Fonction pour partager l'écran
function addScreenShare() {
    var name = document.getElementById('share').value.trim();
    document.getElementById('share').value = ""; // Réinitialise le champ de saisie

    if (!name || !peer) {
        alert("Veuillez entrer un nom valide et vous enregistrer d'abord !");
        return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((screenStream) => {
            console.log('Partage d\'écran démarré', screenStream);

            // Supprime la vidéo précédente du partage si elle existe
            let existingScreenVideo = document.getElementById("video-self-screen");
            if (existingScreenVideo) existingScreenVideo.remove();

            // Ajout du partage d'écran dans l'interface locale
            ajoutVideo(screenStream, "self-screen");

            // Envoyer le flux de partage d’écran à l’utilisateur cible
            let call = peer.call(name, screenStream);

            // Assurer que l'autre utilisateur reçoive bien le partage d'écran
            call.on('stream', function(remoteScreenStream) {
                let screenVideoId = `video-screen-${name}`;
                if (!document.getElementById(screenVideoId)) {
                    ajoutVideo(remoteScreenStream, screenVideoId);
                }
            });

            // Lorsqu'on arrête le partage d'écran, remettre la caméra normale
            screenStream.getVideoTracks()[0].onended = function() {
                console.log("Partage d'écran terminé");
                document.getElementById("video-self-screen")?.remove(); // Supprime la vidéo du partage d'écran
                ajoutVideo(myStream, "self"); // Remet la caméra normale après le partage d'écran
            };
        })
        .catch((err) => {
            console.error('Erreur lors du partage d\'écran:', err);
            alert('Impossible de partager l\'écran.');
        });
}

