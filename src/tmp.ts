import * as path from 'path'
import * as nodefs from 'fs'
import { Writable } from 'stream'
import { readFile, ReadFileOptions } from './readFile'
import { writeFile, WriteFileOptions } from './writeFile'
import { Observable } from 'rxjs'

declare const Buffer

export interface ExitHandler {
  ():void
}

const randomInt = (max:number=100,min:number=0):number => {
  return Math.floor(Math.random()*(max-min))+min
}

const randomChr = ():string => String.fromCharCode(randomInt('z'.charCodeAt(0),'a'.charCodeAt(0)))
const randomWord = (length:number=randomInt(30,2)) => {
  const chrs = '.'.repeat(length).split('.').slice(1).map(()=>randomChr())
  return chrs.join('')
}

const randomName = () => `kio_tmp_${randomWord(9)}.tmp`
const addExitHandler = ( handler:ExitHandler ) => {
    //do something when app is closing
  process.on('exit', handler)

  process.on('SIGINT', handler)
  process.on('uncaughtException', handler)

}

const registerAutoDeletion = (filename:string) => {
  addExitHandler ( () => {
    nodefs.unlinkSync(filename)
  } )
}


export function fileSync ( content?:string, persist:boolean=false ):string 
{
  const tmpFilename = path.join(process.env.TMPDIR,randomName())
  const sub = writeFile(tmpFilename,Observable.of(new Buffer(content||'')),'utf8')
  if(persist!==true)
  {
    registerAutoDeletion(tmpFilename)
  }
  return tmpFilename
}

export function file ( content?:string, persist:boolean=false ):Observable<string> {
  return Observable.of(fileSync(content,persist))
}

export function dirSync ( dirname?:string, persist:boolean=false ):string 
{
  if ( !dirname )
  {
    persist = true
  }
  const tmpDirectory = path.join(process.env.TMPDIR,dirname||'')  
  if (persist!==true)
  {
    registerAutoDeletion(tmpDirectory)
  }
  return tmpDirectory
}

export function dir ( dirname?:string, persist:boolean=false ):Observable<string> {
  return Observable.of<string>(dirSync(dirname,persist))
}