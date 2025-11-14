export function log(
    message: string
) : string
{
    const timestamp = new Date().toLocaleTimeString();
    return  (`[${timestamp}] ${message}\n`);
}