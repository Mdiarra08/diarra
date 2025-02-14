var peer;
var myStream;

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
function register() {
    var name = document.getElementById('name').value.trim();

    if (name) {
        try {
            peer = new Peer(name);  // Créer le peer avec le nom de l'utilisateur

            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                    myStream = stream; // Stocke le flux local
                    ajoutVideo(stream, "self"); // Ajoute la vidéo de l'utilisateur uniquement après l'enregistrement du nom
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
                    console.log('Failed to get local stream', err);
                });
        } catch (error) {
            console.error(error);
        }
    } else {
        alert("Veuillez entrer un nom !");
    }
}

// Fonction pour appeler un utilisateur
function appelUser() {
    var name = document.getElementById('add').value.trim();
    
    if (name) {
        var call = peer.call(name, myStream);
        
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'utilisateur appelé s'il n'y a pas de duplication
        });

        document.getElementById('add').value = ""; // Réinitialiser l'entrée
    }
}

// Fonction pour partager l'écran
function addScreenShare() {
    var name = document.getElementById('share').value.trim();
    document.getElementById('share').value = ""; // Réinitialise le champ de saisie

    if (name) {
        navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
            .then((stream) => {
                // Vérifier si le flux d'écran est correctement récupéré
                console.log('Partage d\'écran démarré', stream);

                // Appeler l'utilisateur avec le flux d'écran
                let call = peer.call(name, stream);
                call.on('stream', function(remoteStream) {
                    ajoutVideo(remoteStream, name); // Afficher le flux vidéo distant
                });
            })
            .catch((err) => {
                console.error('Erreur lors du partage d\'écran:', err);
                alert('Impossible de partager l\'écran. Assurez-vous que vous avez sélectionné une fenêtre à partager.');
            });
    } else {
        alert('Veuillez entrer un nom d\'utilisateur pour partager l\'écran.');
    }
}