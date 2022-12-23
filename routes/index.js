var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/lancertest', function(req, res, next) {
  
  //gestion de l'input
  const {readFileSync} = require('fs');
  const dataFromFile = JSON.parse(readFileSync('./DataInput.txt', 'utf-8'));

  // préparer l'output:
  const result= {Passengers:[], Segments:[]};

  function addToResult(product, type){
    const outputSegment = new OutputSegment(type, product.Passengers, product.Departure,product.Arrival, product.DepartureDateTime, product.ArrivalDateTime)
    result.Segments.push(outputSegment)
    addPassengerToResult(product.Passengers)
  }

  // Classes et fonctions utiles:
  // Classe créant un segment alimentant la propriété Segments de result 
  class OutputSegment{

    constructor(Type, Passengers, Departure, Arrival, DepartureDateTime, ArrivalDateTime){
      this.Type=Type;
      this.Passengers=this.setPassengers(Passengers).sort()
      this.Departure=Departure;
      this.Arrival=Arrival;
      this.DepartureDateTime=DepartureDateTime;
      this.ArrivalDateTime=ArrivalDateTime
    }
      setPassengers=(Passengers)=>{
        var tab=[]
        for (var i=0; i<Passengers.length; i++){
           tab.push(Passengers[i]['@id'])
        }
        return tab
      }

  }

  //fonction alimentant la propriété Passengers de result
  function addPassengerToResult(passengerList){
    passengerList.forEach(
      aPassenger=>{
        let existingPassengerCheck = result.Passengers.find(pass=>{
          return pass['@id']===aPassenger['@id'];
        })  
        if (existingPassengerCheck==undefined){
          result.Passengers.push(aPassenger)
        }       
      }
    )
  }

// Alimentation de l'output en fonction de la struture des segments de l'input: existence propriété Product ou non dans les Segments
  dataFromFile.GetReservationRS.Reservation.Segments.forEach(element=>{
  
    element.Segment.Product!==undefined?
    element.Segment.Product.Air!==undefined ? addToResult(element.Segment.Product.Air, "AIR") : addToResult(element.Segment.Product.Rail, "RAIL")
    :element.Segment.Air!==undefined?  addToResult(element.Segment.Air, "AIR") : addToResult(element.Segment.Rail, "RAIL")

  })

//Tris des propriétés de l'output:
result.Passengers.sort((a,b) => a['@id'] - b['@id'])

result.Segments.sort((a, b)=>{
  if (a.DepartureDateTime<b.DepartureDateTime){
    return -1
  }
  if (a.DepartureDateTime>b.DepartureDateTime){
    return 1
  }
  return 0
}
)
 
  res.json({result});
});


module.exports = router;
