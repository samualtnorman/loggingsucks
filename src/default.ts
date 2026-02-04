export type LogFields<T> = Record<string, T | undefined>

export type LogContext<TCustom> = { name: string, parent: LogContext<TCustom> | undefined, custom: TCustom | undefined }

export type MakeLoggerOptions<TFieldValue, TCustom> = {
	onContext: (context: LogContext<TCustom>) => void
	onFields: (context: LogContext<TCustom>, fields: LogFields<TFieldValue>) => void
	onReturn: (context: LogContext<TCustom>, value: unknown) => void
	onThrow: (context: LogContext<TCustom>, error: unknown) => void
}

export type LogFn<TFieldValue> = (fields: LogFields<TFieldValue>) => void

export type ContextlessLogFn<TFieldValue> = (name: string, fields: LogFields<TFieldValue>) => void

export type CaptureLogsFn<TFieldValue, TCustom> = <TReturn>(
	name: string,
	callback: (_: { log: LogFn<TFieldValue>, logContext: LogContext<TCustom>, captureLogs: CaptureLogsFn<TFieldValue, TCustom> }) => TReturn
) => TReturn

export type LoggingSucks<TFieldValue, TCustom> = { captureLogs: CaptureLogsFn<TFieldValue, TCustom>, log: ContextlessLogFn<TFieldValue> }

export const loggingSucks = <TFieldValue, TCustom>(
	{ onContext, onFields, onReturn, onThrow }: MakeLoggerOptions<TFieldValue, TCustom>
): LoggingSucks<TFieldValue, TCustom> => {
	const log: ContextlessLogFn<TFieldValue> = (name, fields) => {
		const context: LogContext<TCustom> = { name, parent: undefined, custom: undefined }

		onContext(context)
		onFields(context, fields)
	}

	const makeCaptureLogs = (parentContext: LogContext<TCustom> | undefined): CaptureLogsFn<TFieldValue, TCustom> => {
		const captureLogs: CaptureLogsFn<TFieldValue, TCustom> = (name, callback) => {
			const context: LogContext<TCustom> = { name, parent: parentContext, custom: undefined }

			onContext(context)

			const log: LogFn<TFieldValue> = fields => {
				onFields(context, fields)
			}

			let value

			try {
				value = callback({ log, logContext: context, captureLogs: makeCaptureLogs(context) })
			} catch (error) {
				onThrow(context, error)
				throw error
			}

			onReturn(context, value)

			return value
		}

		return captureLogs
	}
	
	return { captureLogs: makeCaptureLogs(undefined), log }
}
