import React, { useState, useRef, useEffect,  useCallback  } from "react";
import { withRouter } from "react-router";
import Webcam from 'react-webcam';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { makeStyles } from '@material-ui/core/styles';
import {sendFeelingsScreenshots, sendUsernameEmail} from "../../../Utils"
import {feelings, questionNumerical, answerNumerical, questionCanadaCulture,
    answercanadaCulture,questionLetter,tWords,fWords,questionMemory, questionDefinition,googleDefinitionForApagogie,googleDefinitionForLallation } from "./Constants"
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';

//Ceci est le premier écran de l'expérience d'Intelligence Emotionnelle.
//On y invite l'utilisateur à se imiter des émotions et se prendre en photo.
//C'est également dans ce fichier que l'on choisit aléatoirement les questions pour la suite du test.
//On y associe également les réponses

function EmotionsPerformancesScreen(props)  {

    useEffect(() => {
        if(props === undefined || props.location.user === undefined){
            history.push("/experiences")
        }

    })

    const classes = useStyles();
    const history = useHistory();
    const [tileData, setTileData]=useState([])
    const [userEmail, setUserEmail]=useState('')
    const [userEmailValidation, setUserEmailValidation]=useState(true)
    const [experienceStarted,setExperienceStarted]=useState(false)
    const [screenshotSession,setScreenshotSession]=useState(false)
    const [compteurScreenshots, setCompteur]=useState(1)
    const [currentFeeling,setCurrentFeeling]=useState(feelings[compteurScreenshots-1])

    //TODO : déplacer cette fonction plus en amont dans le scénario nominal
    const defineQuestions=()=>{
        /*On crée un dictionnaire avec les questions et les réponses aléatoirement piochées. 
        Certaines tâches ne changent pas selon la série et ne sont donc pas concernées.
        Voici l'architecture du dictionnaire de chacune des deux séries. 
        */
        const firstSerie={"Questions":
                            {"numerical": null,"canadaCulture":null, "letter":null,"memory":null, "definition":null}, 
                          'Answers':
                            {"numerical":null,"canadaCulture":null,'letter':null,"memory":null, "definition":null}}
        const secondSerie={"Questions":
                            {"numerical": null,"canadaCulture":null, "letter":null,"memory":null, "definition":null}, 
                          'Answers':
                            {"numerical":null,"canadaCulture":null,'letter':null,"memory":null, "definition":null}}

        var rand = Math.floor(Math.random() * Math.floor(2))
        var randNumerical = rand        
        firstSerie["Questions"]["numerical"] = questionNumerical[rand]
        firstSerie["Answers"]["numerical"] = answerNumerical[rand]
        secondSerie["Questions"]["numerical"] = questionNumerical[(rand+1)%2]
        secondSerie["Answers"]["numerical"] = answerNumerical[(rand+1)%2]

        rand = Math.floor(Math.random() * Math.floor(2))
        firstSerie["Questions"]["canadaCulture"] = questionCanadaCulture[rand]
        firstSerie["Answers"]["canadaCulture"] = answercanadaCulture[rand]
        secondSerie["Questions"]["canadaCulture"] = questionCanadaCulture[(rand+1)%2]
        secondSerie["Answers"]["canadaCulture"] = answercanadaCulture[(rand+1)%2]

        rand = Math.floor(Math.random() * Math.floor(2))
        firstSerie["Questions"]["letter"] = questionLetter[rand]
        secondSerie["Questions"]["letter"] = questionLetter[(rand+1)%2]

        if(firstSerie["Questions"]["letter"] === 't'){
            firstSerie["Answers"]["letter"] = tWords
            secondSerie["Answers"]["letter"] = fWords
        }else{
            firstSerie["Answers"]["letter"] =fWords
            secondSerie["Answers"]["letter"] = tWords
        }

        rand = Math.floor(Math.random() * Math.floor(2))
        firstSerie["Questions"]["memory"] = questionMemory[rand]
        secondSerie["Questions"]["memory"] = questionMemory[(rand+1)%2]

        //Cette question dépend également de la question choisie pour les suites numériques. Il y a donc 4 possibilités de réponses
        if(randNumerical === 0){ //On vérifie la série choisie pour la question sur les suites numériques en regardant la première réponse
            if(rand===0){ 
                firstSerie["Answers"]["memory"] = '4' //Le deuxième nombre de la deuxième suite numérique (question mémory 1) de la suite choisie pour cette série (question numerical 1) est 4
                secondSerie["Answers"]["memory"] = '240'
            }else {
                firstSerie["Answers"]["memory"] = '121'
                secondSerie["Answers"]["memory"] = '300'
            }
        }else{
            if(rand===0){ 
                firstSerie["Answers"]["memory"] = '300'
                secondSerie["Answers"]["memory"] = '121'
            }else {
                firstSerie["Answers"]["memory"] = '240'
                secondSerie["Answers"]["memory"] = '4'
            }
        }


        rand = Math.floor(Math.random() * Math.floor(2))
        firstSerie["Questions"]["definition"] = questionDefinition[rand]
        secondSerie["Questions"]["definition"] = questionDefinition[(rand+1)%2]

        if(firstSerie["Questions"]["definition"] === 'lallation'){
            firstSerie["Answers"]["definition"] = googleDefinitionForLallation
            secondSerie["Answers"]["definition"] = googleDefinitionForApagogie
        }else{
            firstSerie["Answers"]["definition"] = googleDefinitionForApagogie
            secondSerie["Answers"]["definition"] = googleDefinitionForLallation
        }

        return [firstSerie, secondSerie]
    }

    const videoConstraints = {
        width: 550,
        height: 360,
        facingMode: "user"  
        };
        
    const webcamRef = useRef(null);
    
    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot({width: 550, height: 360});
            setCurrentFeeling(feelings[compteurScreenshots])
            setTileData(tileData => [...tileData, {img : imageSrc, title:feelings[compteurScreenshots-1]}])
            setCompteur(compteurScreenshots+1)
            if(compteurScreenshots === feelings.length){
                setScreenshotSession(false)
            }
        },
        [webcamRef, compteurScreenshots ]
    );

    const startExpe= () => {
        setExperienceStarted(true)
        setScreenshotSession(true)
    }

    function handleUserEmail(e){
        setUserEmail(e.target.value) 
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(regex.test(e.target.value)){
            setUserEmailValidation(false)
        }else{
            setUserEmailValidation(true)
        }
    }


    //On appelle la fonction permettant d'envoyer les résultats à écrire en BD (grâce à un appel à l'API)
    //On appelle également la fonction permettant d'ajouter en BD le username et son email
    //Ensuite on passe à la suite de l'expérience en renseignant les questions réponses pour les 2 séries
    const sendResult=()=>{
        for (var i=0; i<tileData.length; i++){
            sendFeelingsScreenshots(props.location.user.username, tileData[i]['title'],tileData[i]['img'] )
        }
        sendUsernameEmail(props.location.user.username,userEmail )
        var series = defineQuestions()
        history.push({pathname:"/experience/EmotionsPerformances",
            user : props.location.user,
            actualSerie : series[0],
            nextSerie : series[1]
            })
    }
    

return (
    <div className={classes.root}>   
        { experienceStarted === false ? <p>
            Bienvenue dans l'expérience portant sur la logique et les émotions.<br/> 
            Nous allons dans un premier temps vous demandez d'accéder à votre webcam 
            afin de prendre une photo de vous exprimant plusieures expressions faciales. 
            Merci de ne pas exagérer vos émotions et de les rendre le plus réaliste possible.<br/>
            Si vous ne possédez pas de webcam sur cet ordinateur ou si vous n’êtes pas disposés à nous en donner l’accès, l'expérience ne sera pas possible.
            Merci tout de même pour votre intérêt.<br/><br/><br/>
            Pouvez-vous également joindre votre adresse électronique pour que nous puissions vous recontacter ultérieurement.<br/><br/>
            
            <input type="text" placeholder="Email..." name="userEmail"  value={userEmail} onChange={e=> handleUserEmail(e)}/>
            <br/>
        </p> :null }
        { experienceStarted === false ? <Button variant="contained" disabled={userEmailValidation} color="primary" className={classes.startButton} onClick={startExpe}> Démarrer</Button> : null}

        
        { screenshotSession === true ? 
        <div>
            <p> Veuillez vous prendre en photo à l'aide du bouton "capture image" en réalisant une expression représentant :</p>
            <p> <b>{currentFeeling}</b></p>
        <Webcam
            audio={false}
            height={360}
            ref={webcamRef}
            mirrored={true}
            screenshotFormat="image/jpeg"
            width={640}
            videoConstraints={videoConstraints}
      /></div>: null }
      { screenshotSession === true ? <div><Button variant="contained" color="primary" onClick={capture}>Capture photo</Button> </div>: null }
      
      <GridList className={classes.grid} cellHeight={150} cols={4} >
        {tileData.map((tile) => (
          <GridListTile key={tile.img}>
            <img src={tile.img} alt={tile.title} />
            <GridListTileBar
              title={tile.title}
            />
          </GridListTile>
        ))}
      </GridList>

      { (screenshotSession === false) && (experienceStarted === true)? <div><Button variant="contained" color="primary" onClick={sendResult}>Passer à la suite</Button> </div>: null }

    </div>
    )

}


const useStyles = makeStyles({

    startButton:{
      margin : '5%',

      flexWrap: 'wrap'
    },
    grid:{
        margin:'5%'
    },
    root: {
        display: 'flex',
        flexDirection:"column",
        justifyContent:'center',
        alignItems : 'center',
      },
      gridList: {
        width: 500,
        height: 450,
      },
})

 
export default withRouter(EmotionsPerformancesScreen);