import {TGetResponse} from '../../types/index.ts'
import {TPostResponse} from '../../types/index.ts'
import {TPostRequest} from '../../types/index.ts'
import {IApi} from '../../types/index.ts'

export class ClientApi{
    private _api: IApi;

    constructor(api: IApi)  {
        this._api = api;
    }

    async getData(): Promise<TGetResponse>{
        return await this._api.get<TGetResponse>('/api/weblarek/product');
    }

    async setData(data: TPostRequest): Promise<TPostResponse> {
        const response: TPostResponse = 
            await this._api.post<TPostResponse>('/api/weblarek/order', data);
        return response;
    }
}