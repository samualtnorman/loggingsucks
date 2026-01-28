import type { JsonValue } from "@samual/types"

export type LogFields = Record<string, JsonValue | undefined>

export type LogContext<TCustom> = { name: string, parent: LogContext<TCustom> | undefined, custom: TCustom | undefined }

export type MakeLoggerOptions<TCustom> = {
	onContext: (context: LogContext<TCustom>) => void
	onFields: (context: LogContext<TCustom>, fields: LogFields) => void
	onThrow: (context: LogContext<TCustom>, error: unknown) => void
}

export type LogFn = (fields: LogFields) => void

export type ContextlessLogFn = (name: string, fields: LogFields) => void

export type CaptureLogsFn<TCustom> = <TReturn>(
	name: string,
	callback: (_: { log: LogFn, logContext: LogContext<TCustom>, captureLogs: CaptureLogsFn<TCustom> }) => TReturn
) => TReturn

export type LoggingSucks<TCustom> = { captureLogs: CaptureLogsFn<TCustom>, log: ContextlessLogFn }

export const loggingSucks = <TCustom = undefined>(
	{ onContext, onFields, onThrow }: MakeLoggerOptions<TCustom>
): LoggingSucks<TCustom> => {
	const log: ContextlessLogFn = (name, fields) => {
		const context: LogContext<TCustom> = { name, parent: undefined, custom: undefined }

		onContext(context)
		onFields(context, fields)
	}

	const makeCaptureLogs = (parentContext: LogContext<TCustom> | undefined): CaptureLogsFn<TCustom> => {
		const captureLogs: CaptureLogsFn<TCustom> = (name, callback) => {
			const context: LogContext<TCustom> = { name, parent: parentContext, custom: undefined }

			onContext(context)

			const log: LogFn = fields => {
				onFields(context, fields)
			}

			try {
				return callback({ log, logContext: context, captureLogs: makeCaptureLogs(context) })
			} catch (error) {
				onThrow(context, error)
				throw error
			}
		}

		return captureLogs
	}
	
	return { captureLogs: makeCaptureLogs(undefined), log }
}
