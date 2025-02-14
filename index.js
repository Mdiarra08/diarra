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

// Création du peer (utilisateur)
var peer = new Peer();
var myStream;

// Récupération du flux utilisateur (audio + vidéo)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function(stream) {
        myStream = stream; // Stocke le flux local

        // Ajout de la propre vidéo de l'utilisateur
        ajoutVideo(stream, "self");

        // Réception d'un appel entrant
        peer.on('call', function(call) {
            call.answer(myStream); // Répondre avec le flux local

            call.on('stream', function(remoteStream) {
                ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo de l'appelant
            });
        });
    })
    .catch(function(error) {
        console.error("Erreur lors de l'accès à la caméra/micro :", error);
    });

// Fonction pour appeler un utilisateur
function appelUser() {
    var name = document.getElementById('add').value.trim();
    
    if (name) {
        var call = peer.call(name, myStream);
        
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'utilisateur appelé
        });

        document.getElementById('add').value = ""; // Réinitialiser l'entrée
    }
}

// Fonction pour partager l'écran
function partagerEcran() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        .then(function(screenStream) {
            // Remplace le flux vidéo actuel par le partage d'écran
            let screenTrack = screenStream.getVideoTracks()[0];
            let sender = peer.connections[Object.keys(peer.connections)[0]][0].peerConnection.getSenders()
                .find(s => s.track.kind === "video");

            if (sender) {
                sender.replaceTrack(screenTrack);
            }

            // Ajouter l'affichage du partage d'écran
            ajoutVideo(screenStream, "screen");

            // Rétablir la vidéo de la webcam une fois le partage terminé
            screenTrack.onended = function() {
                sender.replaceTrack(myStream.getVideoTracks()[0]);
                document.getElementById(video-screen).remove();
            };
        })
        .catch(function(error) {
            console.error("Erreur lors du partage d'écran :", error);
        });
}