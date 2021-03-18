//import { render } from '@testing-library/react';
import React from 'react'
import './game.css'

const cell_size = 20;
const width = 800;
const height = 600;

class Cell extends React.Component{
    render(){
        const {x,y} = this.props;
        return(
            <div className = "Cell" style={{
                    left: `${cell_size*x+1}px`, 
                    top: `${cell_size*y+1}px`, 
                    height:`${cell_size - 1}px`, 
                    width:`${cell_size - 1}px`,
            }} />
        );
    }
}

class Game extends React.Component{
    constructor(){
        super();
        this.rows = height/cell_size;
        this.columns = width/cell_size;
        this.board = this.clearBoard();
    }
        state = {
            cells: [],
            interval: 100,
            isRunning: false
        }

        clearBoard(){
            let board = []
            for(let y=0;y<this.rows;y++)
            {
                board[y] = [];
                for(let x=0;x<this.columns;x++)
                {
                    board[y][x] = false;
                }
            }
            return board;
        }

        getElementOffset(){
            const rect = this.boardRef.getBoundingClientRect();
            const doc = document.documentElement;
            return{
                x: (rect.left + window.pageXOffset) - doc.clientLeft,
                y: (rect.top + window.pageYOffset) - doc.clientTop
            };
        }

        createCells(){
            let cells = [];
            for(let y=0;y<this.rows;y++)
            {
                for(let x=0;x<this.columns;x++)
                {
                    if(this.board[y][x])
                        cells.push({x,y});
                }
            }
            return cells;
        }

        handleclick = (event)=>{
            const elOffset = this.getElementOffset();
            const xOffset = event.clientX - elOffset.x;
            const yOffset = event.clientY - elOffset.y;
            const x = Math.floor(xOffset/cell_size);
            const y = Math.floor(yOffset/cell_size);
            if(x >= 0 && x<= this.columns && y >=0 && y<=this.rows)
            {
                this.board[y][x] = !this.board[y][x];
            }
            this.setState({
                cells: this.createCells()
            });
        }
        
        handleClear = () => {
            this.board = this.clearBoard();
            this.setState({
                cells: this.createCells()
            });
        }

        run = () => {
            this.setState({
                isRunning: true
            });
            this.runIteration()
        }

        stop = () => {
            this.setState({
                isRunning: false
            });
            if(this.timeoutHandler){
                window.clearTimeout(this.timeoutHandler);
                this.timeoutHandler = null;
            }
        }

        intervalChange = (event) => {
            this.setState({
                interval: event.target.value
            });
        }

        runIteration = () => {
            let newBoard = this.clearBoard();
            for(let y=0;y<this.rows;y++)
            {
                for(let x=0;x<this.columns;x++)
                {
                    let neighbourCount = this.getNeighbours(this.board,x,y);
                    if(this.board[y][x])
                    { 
                        if(neighbourCount === 2 || neighbourCount === 3)
                            newBoard[y][x] = true;
                        else
                            newBoard[y][x] = false;
                    }
                    else
                    {
                        if(!this.board[y][x] && neighbourCount === 3)
                            newBoard[y][x] = true;
                    }
                }
            }
            this.board = newBoard;
            this.setState({
                cells: this.createCells()
            })
            this.timeoutHandler = window.setTimeout(() => {
                this.runIteration()
            }, this.state.interval)
        }

        getNeighbours = (board,x,y)=>{
            let count = 0;
            if(x>=0 && x<this.columns && y+1>=0 && y+1<this.rows && board[y+1][x])
                count++;
            if(x+1>=0 && x+1<this.columns && y>=0 && y<this.rows && board[y][x+1])
                count++;
            if(x>=0 && x<this.columns && y-1>=0 && y-1<this.rows && board[y-1][x])
                count++;
            if(x-1>=0 && x-1<this.columns && y>=0 && y<this.rows && board[y][x-1])
                count++;
            if(x+1>=0 && x+1<this.columns && y+1>=0 && y+1<this.rows && board[y+1][x+1])
                count++;
            if(x+1>=0 && x+1<this.columns && y-1>=0 && y-1<this.rows && board[y-1][x+1])
                count++;
            if(x-1>=0 && x-1<this.columns && y+1>=0 && y+1<this.rows && board[y+1][x-1])
                count++;
            if(x-1>=0 && x-1<this.columns && y-1>=0 && y-1<this.rows && board[y-1][x-1])
                count++;
            return count;
        }

        render(){
            const {cells} = this.state;
            return(
            <div>
                <div className="gameboard" 
                style={{width: width, height: height, backgroundSize: `${cell_size}px ${cell_size}px`}} 
                onClick={this.handleclick} 
                ref={(n)=>{this.boardRef = n;}}>
                    {cells.map(cell => (<Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>))}
                </div>
                <div className="controls">
                    interval: <input value={this.state.interval} onChange={this.intervalChange}/> msec
                    {
                        this.state.isRunning ?
                        <button className="button" onClick={this.stop}>Stop</button>:
                        <button className="button" onClick={this.run}>Start</button>
                    }
                    <button className="button" onClick={this.handleClear}>Reset</button>
                </div>
            </div>
        );
    }
}
export default Game;