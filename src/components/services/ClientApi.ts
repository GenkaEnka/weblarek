import {TGetResponse} from '../../types/index.ts'
import {TPostResponse} from '../../types/index.ts'
import {TPostRequest} from '../../types/index.ts'
import {IApi} from '../../types/index.ts'

export class ClientApi{
    private _api: IApi;

    constructor(api: IApi)  {
        this._api = api;
    }

    getData(): Promise<TGetResponse>{
        return this._api.get<TGetResponse>('/product');
    }

    setData(data: TPostRequest): Promise<TPostResponse> {
        return this._api.post<TPostResponse>('/order', data);
    }
}