export interface Stat {
	updated: number
	, interval : number
	, log : (s:string) => any
	, stat : any
}

export const create = 
	( log: (s:string)=>any, interval: number, defaultStat?:any ): Stat => (
		{ updated: Date.now()
		, interval
		, log
		, stat: defaultStat || null
		}
	);

const isInterval = ({interval, updated}:Stat): boolean =>
		Date.now() - updated >= interval;

export const onUpdate = 
	( fn:(l:Stat)=>Stat ) => (stat:Stat): Stat =>
		!isInterval(stat)
			? fn(stat)
			: stat;

export const onInterval =
	( fn:(l:Stat)=>Stat ) => (stat:Stat) :Stat =>
		isInterval(stat)
			? Object.assign(
					fn(stat)
					, {updated: Date.now()}
				)
			: stat;