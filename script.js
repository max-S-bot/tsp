// python -m http.server

const w = 200;
const h = 300;
const numPoints = 30;
const numTrips = 30;
const numGens = 300;
const maxTripL = numPoints*Math.sqrt(w*w+h*h);
const elitismConstant = Math.ceil(numTrips/10);
const mRate = .05;
let crossover;

document.getElementById("og").addEventListener("click",ogAlg);
document.getElementById("pmx").addEventListener("click",pmxAlg);
document.getElementById("ox").addEventListener("click",oxAlg);
document.getElementById("cx").addEventListener("click",cxAlg);

//window.addEventListener("load",run);

function ogAlg() {
    crossover = ogCrossover;
    run();
}

function pmxAlg() {
    crossover = pmxCrossover;
    run();
}

function oxAlg() {
    crossover = oxCrossover;
    run();
}

function cxAlg() {
    crossover = cxCrossover;
    run();
}

function setup() {} 

function run() {
    initialSetup();
    let infoArr = [];
    let trips = createTrips();
    infoArr.push(info(trips))
    for (let i=0; i<numGens; i++) {
        trips = crossover(trips);
        infoArr.push(info(trips))
    }
    printStuff(infoArr);
    createCanvas(w*3, h*3);
    background(500);
    canvasSetup();
    drawPath(fittest(trips));
    buttons();
}



function drawPath(trip) {
    for (let i=0; i<numPoints; i++) {
        let p = trip[i];
        let pN = trip[i+1]
        line(3*p.x,3*p.y,3*pN.x,3*pN.y);
    }
    stroke("red");
    strokeWeight(10);
    point(3*trip[0].x,3*trip[0].y);
}

function canvasSetup() {
    for (let i=0; i<=w; i++) {
        for (let j=0; j<=h; j++) {
            point(i*3,j*3);
        }
    }
    
}

function buttons() {
    document.getElementById("top").innerHTML="Go back up";
    document.getElementById("top").addEventListener("click",jumpToTop)
    document.getElementById("bottom").addEventListener("click", jumpToBottom);
    document.getElementById("bottom").innerHTML="Jump to canvas";
}

function jumpToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

function jumpToTop() {
    window.scrollTo(0, 0);
}

function info (trips) {
    let final = [tripFitness(fittest(trips))];
    final.push(trips.reduce((total,trip)=>(total+tripFitness(trip)),0)/numTrips);
    return final;
}

function initialSetup() {
    let str="";
    str+="Parameters: <br>";
    str+="Grid dimensions: "+w+" by "+h+"<br>";
    str+="Number of points to visit: "+numPoints+"<br>";
    str+="Amount of paths in a generation: "+numTrips+"<br>";
    str+="Number of generations: "+numGens+"<br>";
    str+="Mutation rate: "+mRate+"<br>";
    document.getElementById("params").innerHTML = str;
}

function printStuff(infoArr) {
    let str = "";
    for (let i=0; i<=numGens; i++) {
        str+="Fittest member of gen "+i+": "+infoArr[i][0]+"<br>";
        str+="Average Fitness of gen "+i+": "+infoArr[i][1]+"<br>";
        str+="<br>";
    }
    document.getElementById("sol").innerHTML = str;
}

function d(p,q) {
    const dx2 = Math.pow(p.x-q.x,2);
    const dy2 = Math.pow(p.y-q.y,2);
    return Math.sqrt(dx2+dy2);
}

function createPoints() {
    let points = [];
    for (let i=0; i<numPoints; i++) {
        points.push({
            "x": Math.floor((w+1)*Math.random()),
            "y": Math.floor((h+1)*Math.random())
        });
    }
    return points;
}

function createTrips() {
    let points = createPoints();
    let start = Math.floor(Math.random()*numPoints);
    start = points.splice(start,1);
    let trips = [];
    for (let i=0; i<numTrips; i++) {
        trips.push(start.concat(createTrip(points)).concat(start));
    }
    return trips;
}

function createTrip(points) {
    let trip = [];
    let pointsTemp = [].concat(points);
    for (let i=1; i<numPoints; i++) {
        let p = Math.floor(pointsTemp.length*Math.random());
        trip.push(pointsTemp[p]);
        pointsTemp.splice(p,1);
    }
    return trip;
}

function tripFitness(trip) {
    let dist = 0;
    for (let i=0; i<numPoints; i++) {
        dist+=d(trip[i],trip[i+1]);
    }
    return 1-dist/maxTripL;
}

function tripsFitness(trips) {
    return trips.map(trip=>tripFitness(trip));
}

function weightedPool(trips) {
    let tFitness = tripsFitness(trips);
    let pool = [];
    let scalar = 100;
    for (let i=0; i<numTrips; i++) {
        for (let j=0; j<scalar*tFitness[i]; j++) {
            pool.push(trips[i]);
        }
    }
    return pool;
}

function ogCrossover(trips) {
    let pool = weightedPool(trips);
    let nextGen = elitism(trips);
    for (let i=0; i<numTrips-elitismConstant; i++) {
        let p1 = pool[Math.floor(pool.length*Math.random())];
        let p2 = pool[Math.floor(pool.length*Math.random())];
        let p = [p1,p2];
        let newTrip = [p[0][0]];
        for (let j=1; j<numPoints; j++) {
            newTrip.push(getNext(p[j%2],newTrip));
        }
        nextGen.push(swapMutation(newTrip.concat([p[0][0]])));
    }
    return nextGen;
}

function elitism(trips) {
    let tTrips = [].concat(trips);
    let top10 = [];
    for (let i=0; i<elitismConstant; i++) {
        top10.push(fittest(tTrips));
        tTrips.splice(0,1);
    }
    return top10;
}

function getNext(p,trip) {
    let next = 1+p.indexOf(trip[trip.length-1]);
    while(trip.includes(p[next%(numPoints+1)])) {
        next++;
    }
    return p[next%(numPoints+1)];
}

function swapMutation(trip) {
    if (Math.random()>mRate) {return trip;}
    let index1 = Math.floor((numTrips-2)*Math.random())+1;
    let index2 = Math.floor((numTrips-2)*Math.random())+1;
    return swap(index1,index2,trip);
}

function swap(index1,index2,trip) {
    let swappedTrip=[].concat(trip);
    swappedTrip[index1]=trip[index2];
    swappedTrip[index2]=trip[index1];
    return swappedTrip;
}

function pmxCrossover(trips) {
    let pool = weightedPool(trips);
    let nextGen = elitism(trips);
    const pmxConst = Math.floor(.1*numPoints);
    for (let i=0; i<numTrips-elitismConstant; i++) {
        let p1 = pool[Math.floor(pool.length*Math.random())];
        let p2 = pool[Math.floor(pool.length*Math.random())];
        let newTrip = [];
        let start = Math.floor(Math.random()*numPoints);
        for (let j=start; j<start+pmxConst; j++) {
            newTrip.push(p1[j%numPoints]);
        }
        for (let j=start+pmxConst; j<start+numPoints; j++) {
            newTrip[j%numPoints] = pmxNext(p2,newTrip);
        }
        newTrip=
        //needs work
        newTrip[numPoints-1] = p1[0];
        newTrip[0] = p1[0];
        newTrip
        nextGen.push(swapMutation(newTrip));
    }

    return nextGen;
}

function pmxNext(p2,newTrip) {
    let n = 1;
    while (contains(newTrip,p2[n])) {
        n++;
    }
    return p2[n];
}

function contains(newTrip,point) {
    for (let i=1; i<numPoints-1; i++) {
        if (newTrip[i]==point) {return true;}
    }
    return false;
}

function oxCrossover(trips) {
    let pool = weightedPool(trips);
    let nextGen = elitism(trips);
    for (let i=0; i<numTrips-elitismConstant; i++) {
        let p1 = pool[Math.floor(pool.length*Math.random())];
        let p2 = pool[Math.floor(pool.length*Math.random())];
        let newTrip = [];
        //incomplete implementation

        nextGen.push(swapMutation(newTrip.concat([p[0][0]])));
    }

    return nextGen;
}

function cxCrossover(trips) {
    let pool = weightedPool(trips);
    let nextGen = elitism(trips);
    for (let i=0; i<numTrips-elitismConstant; i++) {
        let p1 = pool[Math.floor(pool.length*Math.random())];
        let p2 = pool[Math.floor(pool.length*Math.random())];
        let newTrip = [];
        //incomplete implementation

        nextGen.push(swapMutation(newTrip.concat([p[0][0]])));
    }

    return nextGen;
}

function fittest (trips) {
    let f = trips[0];
    for (let i=1; i<trips.length; i++) {
        if (tripFitness(trips[i])>tripFitness(f)) {
            f = trips[i];
        }
    }
    return f;
}






