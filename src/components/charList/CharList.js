import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import useMarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';

import './charList.scss';

const setContent = (process, Component, newItemLoading) => {
    switch (process) {
        case 'waiting': 
            return <Spinner />;
            break;
        case 'loading': 
            return newItemLoading ? <Component/> : <Spinner />;
            break;
        case 'confirmed':
            return <Component/>;
            break;
        case 'error':
            return <ErrorMessage />;
            break;
        default:
            throw new Error('Unexpected process state');
    }
}

const CharList = (props) => {

    const [charList, setCharList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(210);
    const [charEnded, setCharEnded] = useState(false);
    
    const {getAllCharacters, process, setProcess} = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])

    const onRequest = (offset, initial) => {
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllCharacters(offset).then(onCharListLoaded).then(() => setProcess('confirmed'))
    }

    const onCharListLoaded = (newCharList) => {
        // В ОБЪЯВЛЕНИИ Ф-ЦИИ НУЖНО ПОСТАВИТЬ async
        //const {logger, secondLog} = await import('./someFunc');
        //secondLog();

        let ended = false;
        if (newCharList.length < 9) {
            ended = true;
        }

        setCharList(charList => [...charList, ...newCharList]);
        setNewItemLoading(newItemLoading => false);
        setOffset(offset => offset + 9);
        setCharEnded(charEnded => ended);
    }

    const itemRefs = useRef([]);

    const focusOnItem = (id) => {
        itemRefs.current.forEach(item => item.classList.remove('char__item_selected'));
        itemRefs.current[id].classList.add('char__item_selected');
        itemRefs.current[id].focus();
    }

    // Этот метод создан для оптимизации, 
    // чтобы не помещать такую конструкцию в метод render
    function renderItems(arr) {
        const items =  arr.map((item, i) => {
            let imgStyle = {'objectFit' : 'cover'};
            if (item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
                imgStyle = {'objectFit' : 'unset'};
            }

            return (
                <CSSTransition
                    timeout={500}
                    classNames="char__item"
                    key={item.id}>
                    <li 
                        tabIndex={0}
                        className="char__item"
                        onClick={() => {
                            props.onCharSelected(item.id);
                            focusOnItem(i);
                        }}
                        onKeyPress={(e) => {
                            if (e.key === ' ' || e.key === "Enter") {
                                props.onCharSelected(item.id);
                                focusOnItem(i);
                            }
                        }}
                        ref={el => itemRefs.current[i] = el}>
                        <img src={item.thumbnail} alt={item.name} style={imgStyle}/>
                        <div className="char__name">{item.name}</div>
                    </li>
                </CSSTransition>
            )
        });
        // А эта конструкция вынесена для центровки спиннера/ошибки
        return (
            <ul className="char__grid">
                <TransitionGroup component={null}>
                    {items}
                </TransitionGroup>
            </ul>
        )
    }

    // ЕСЛИ ПРОСТО ЭКСПОРТИРУЕМ
    //if (loading) {
    //    import('./someFunc')
    //        .then(obj => obj.logger())
    //        .catch();
    //}

    // ЕСЛИ ЕСТЬ ЭКСПОРТ ДЕФОЛТ
    //if (loading) {
    //    import('./someFunc')
    //        .then(obj => obj.default())
    //        .catch();
    //}

    const elements = useMemo(() => {
        return setContent(process, () => renderItems(charList), newItemLoading);
    }, [process])

    return (
        <div className="char__list">
            {elements}
            <button 
                className="button button__main button__long"
                disabled={newItemLoading}
                style={{'display' : charEnded ? 'none' : 'block'}}
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

CharList.propTypes = {
    onCharSelected: PropTypes.func.isRequired
}

export default CharList;

//МОЙ МЕТОД

//    componentDidMount () {
//        this.updateChar();
//    }
//
//    setChar = (chars) => {
//        this.setState({
//            chars,
//            loading: false
//        });
//    }
//
//    onError = () => {
//        this.setState({
//            loading: false,
//            error: true
//        })
//    }
//    
//    updateChar = () => {
//        this.marvelService
//            .getAllCharacters()
//            .then(this.setChar)
//            .catch(this.onError);
//    }
//
//    render () {
//        const {loading, error} = this.state;
//        const errorMessage = error ? <ErrorMessage /> : null;
//        const spinner = loading ? <Spinner /> : null;
//        const content = !(loading || error) ? <ViewCharacters chars={this.state.chars}/> : null;
//        
//
//        return (
//            <div className="char__list">
//                {errorMessage}
//                {spinner}
//                {content}    
//                <button className="button button__main button__long">
//                    <div className="inner">load more</div>
//                </button>
//            </div>
//        )
//    }
//}
//
////char__item_selected
//
//const ViewCharacters = ({chars}) => {
//    const elements = chars.map(item => {
//        const {id, ...itemProps} = item
//        return (
//            <ViewCharacter 
//                key={id}
//                {...itemProps} />
//        )
//    });
//
//    return (
//        <ul className="char__grid">
//            {elements}
//        </ul>
//    );
//}
//
//class ViewCharacter extends Component {
//    render () {
//        const {name, thumbnail} = this.props;
//        //let imgStyle = {'objectFit' : 'cover'};
//        //if (thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
//        //    imgStyle = {'objectFit' : 'unset'};
//        //}
//        
//        return (
//            <li className="char__item">
//                <img src={thumbnail} alt="abyss" style={imgStyle}/>
//                <div className="char__name">{name}</div>
//            </li>
//        );
//    }
//}
//
//export default CharList;