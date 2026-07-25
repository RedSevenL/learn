const url: string = 'https://api.thedogapi.com/v1/images/search';
const button: HTMLButtonElement | null = document.querySelector('button');
const tableBody: HTMLTableSectionElement | null = document.querySelector('#tableBody');

interface DogType {
    id: string;
    url: string;
    height: number;
    width: number;
    test?: boolean;
}

class Dog implements DogType {
    test?: boolean;
  
    constructor(
      public id: string,
      public url: string,
      public height: number,
      public width: number
    ) {}
  }
//构造参数前加了 public，相当于 id: string;this.id = id;
/*class Dog implements DogType {
  id: string;
  url: string;
  height: number;
  width: number;
  test?: boolean;

  constructor(id: string, url: string, height: number, width: number) {
    this.id = id;
    this.url = url;
    this.height = height;
    this.width = width;
  }
}*/

class WebDisplay {
    public static addData(data: DogType) :void {
        const dog: Dog = new Dog(data.id, data.url, data.height, data.width);
        const tableRow: HTMLTableRowElement = document.createElement('tr');
        tableRow.innerHTML = `
        <td>${dog.id}</td>
        <td><img src="${dog.url}" /></td>
        <td>${dog.height.toString()}</td>
        <td>${dog.width.toString()}</td>
        <td>${dog.url}</td>
        <td><a href="#">X</a></td>
        `;
        tableBody?.appendChild(tableRow); 
    }
    public static deleteData(deleteButton: HTMLAnchorElement): void {
        const td = deleteButton.parentElement as HTMLTableCellElement;
        const tr = td.parentElement as HTMLTableRowElement;
        tr.remove();
         
    }
}

async function getJSON<T>(url: string): Promise<T> {
    const response: Response = await fetch(url);
    const json: T = await response.json();
    return json;
}

async function getData(): Promise<void> {
    try {
        const json: DogType[] = await getJSON<DogType[]>(url);
        const data: DogType = json[0];
        WebDisplay.addData(data);
    }
    catch (error: Error|unknown) {
        let message: string;
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = String(error);
        }
        console.log(message);
        console.error(error);
    }
}

button?.addEventListener('click', getData);

tableBody?.addEventListener('click', (ev) => {
    const target = ev.target;

    if (!(target instanceof HTMLAnchorElement)) {
        return;
    }

    WebDisplay.deleteData(target);
});