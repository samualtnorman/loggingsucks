import { toJsodd } from "jsodd"
import { makeUlid } from "tiny-ulid"
import { CaptureLogsFn, ContextlessLogFn, loggingSucks, type LogFields } from "./default"

type LogItem = {
	name: string,
	from: string,
	to: string,
	id: string,
	error?: string | undefined,
	fields: LogFields,
	logs?: LogItem[] | undefined
}

export const logItems: LogItem[] = []

const isObject = (value: unknown): value is object => typeof value == `object` && !!value
const { isArray } = Array

const deepMergeObjects = (original: object, toMerge: object): void => {
	for (const [ key, child ] of Object.entries(toMerge))
		(original as any)[key] = deepMerge((original as any)[key], child)
}

const deepMerge = (original: unknown, toMerge: unknown): unknown => {
	if (isArray(original) && isArray(toMerge))
		original.push(...toMerge)
	else if (isObject(original) && isObject(toMerge))
		deepMergeObjects(original, toMerge)
	else
		return toMerge

	return original
}

const loggingSucksObject = loggingSucks<LogItem>({
	onContext(context) {
		context.custom = {
			name: context.name,
			from: new Date().toISOString(),
			to: new Date().toISOString(),
			id: makeUlid(),
			fields: {}
		}

		if (context.parent) {
			if (context.parent.custom!.logs)
				context.parent.custom!.logs.push(context.custom)

			else
				context.parent.custom!.logs = [ context.custom ]
		}
		else
			logItems.push(context.custom)
	},
	onFields(context, fields) {
		deepMergeObjects(context.custom!.fields, fields)
	},
	onThrow(context, error) {
		context.custom!.error = toJsodd(error)
	}
})

export const captureLogs: CaptureLogsFn<LogItem> = loggingSucksObject.captureLogs
export const log: ContextlessLogFn = loggingSucksObject.log
