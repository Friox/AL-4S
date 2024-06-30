from typing import Annotated
from fastapi import FastAPI, Form, status
from vbaspy.auth import RiotAuth
import asyncio
import sys

app = FastAPI()


@app.get("/")
async def root():
    return


@app.post("/auth")
async def get_token(id: Annotated[str, Form()], pw: Annotated[str, Form()]):
    INFO = id, pw
    auth = RiotAuth()
    try:
        await asyncio.gather(auth.authorize(*INFO))
        tokentype = auth.token_type
        actoken = auth.access_token
        enttoken = auth.entitlements_token
        puuid = auth.user_id
        return {
            "success": True,
            "tokentype": tokentype,
            "actoken": actoken,
            "enttoken": enttoken,
            "puuid": puuid
        }
    except Exception as e:
        print(e)
        print(e.status)
        print(e.message)
        print(e.headers['Retry-After'])
        # print(e.headers['Retry-After'])
        # print(e.status)
        # print(e.message)
        res = {'success': False, 'code': e.status, 'msg': e.message}
        if (e.status == 429):
            res['timeout'] = e.headers['Retry-After']
        return res
